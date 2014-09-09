var _ = require('underscore'),
    path = require('path'),
    fs = require('fs'),
    moment= require('moment'),
    mongoose = require('mongoose'),
    util = require('../lib/util'),
    config = require('../settings'),
    File = require('../models/files').File,
    Activity = require('../models').Activity;

module.exports.index = function (req, res) {
    var query;
    if (req.user) {
        query = File.find().or([
            {creator: req.user},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = File.find({'permissions.public': true});
    }
    query = query
        .sort('-created')
        .populate('creator', 'username name')
        .limit(20);
    if (req.query.page) {
        query = query.skip(20 * req.query.page);
    }
    query.exec(function (err, files) {
        if (err) {
            throw err;
        }
        res.format({
            html: function () {
                res.render('files/index', {files: files, meta: {title: 'Filer'}});
            },
            json: function () {
                res.json(200, files);
            }
        });
    });
};

module.exports.upload = function (req, res) {
    if (!req.is_member) {
        res.send(403, "Forbidden");
    }
    else {
        var filename = req.files.file.originalname,
            tmp_path = req.files.file.path,
            user = req.user,
            options = {
                permissions: util.parse_web_permissions(req.body.permissions),
                tags: req.body.tags.split(",")
            };

        util.upload_file(tmp_path, filename, user, options, function (err, file) {
            if (err) { throw err; }

            Activity.findOne({
                content_type: 'upload',
                'changes.user': file.creator,
                modified: {$gt: moment(file.created).subtract('minutes', 10).toDate()},
                project: {$exists: false}
            }, function (err, activity) {

                if (!activity) {
                    activity = new Activity();
                    activity.content_type = 'upload';
                }

                activity.content_ids.push(file._id);
                activity.title = file.filename;
                activity.changes.push({user: req.user, changed: file.created});
                activity.permissions = file.permissions;
                activity.modified = file.created;

                if (file.tags) {
                    _.each(file.tags, function (tag) {
                        activity.tags.addToSet(tag);
                    });
                }

                if (!activity.content) {
                    activity.content = {};
                }

                if (file.is_image) {
                    if (!activity.content.images) {
                        activity.content.images = [];
                    }
                    var image_already_there = _.find(activity.content.images, function (image) {
                        return image.thumbnail_path === file.thumbnail_path;
                    });
                    if (!image_already_there) {
                        activity.content.images.push({thumbnail_path: file.thumbnail_path, _id: file._id});
                    }
                }
                else {
                    if (!activity.content.non_images) {
                        activity.content.non_images = [];
                    }
                    var already_there = _.find(activity.content.non_images, function (non_image) {
                        return non_image.filename === file.filename;
                    });
                    if (!already_there) {
                        activity.content.non_images.push({filename: file.filename, _id: file._id});
                    }
                }
                activity.markModified('content');
                activity.save(function (err) {});
            });

            res.format({
                json: function () {
                    file.populate('creator', 'username name', function (err, file) {
                        if (err) { throw err; }
                        res.json(200, file);
                    });
                },
                html: function () {
                    res.redirect("/files");
                }
            });
        });
    }
};

module.exports.update = function (req, res) {
    var id = req.params.id,
        tags = req.body.tags,
        users = [],
        groups = [],
        broadcast = false;

    _.each(req.body.permissions, function (permission) {
        console.log(permission);
    });
    File.findOneAndUpdate({_id: id}, {
        permissions: {
            users: users,
            groups: groups,
            broadcast: broadcast
        },
        tags: tags
    }, function(err, file) {
        if (err) { throw err; }
        console.log(file);
        res.json(200, file);
    });
};

module.exports.delete_file = function (req, res, next) {
    var id = req.params.id;

    File.findByIdAndRemove(id, function (err, file) {
        if (err) { return next(err); }
        Activity.findOneAndRemove({content_type: 'upload', content_id: file._id}, function (err, activity) {});
        res.json(200, file);
    });
};

module.exports.show_file = function (req, res) {
    File.findById(req.params.id).or([
        {creator: req.user._id},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ]).populate('creator', 'name username').exec(function (err, file) {
        if (!file) {
            res.send(404, 'Not found');
        }
        else {
            res.render('files/show_file', {file: file, meta: {title: file.filename}});
        }
    });
};

module.exports.thumbnail_file = function (req, res) {
    var filepath = req.params.path,
        filename = req.params.filename,
        fullpath = path.join(config.files.thumbnail_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendfile(fullpath);
        }
        else {
            res.send(404, 'Not found');
        }
    });
};

module.exports.normal_file = function (req, res) {
    var filepath = req.params.path,
        filename = req.params.filename,
        fullpath = path.join(config.files.normal_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendfile(fullpath);
        }
        else {
            res.send(404, 'Not found');
        }
    });
};

module.exports.large_file = function (req, res) {
    var filepath = req.params.path,
        filename = req.params.filename,
        fullpath = path.join(config.files.large_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendfile(fullpath);
        }
        else {
            res.send(404, 'Not found');
        }
    });
};

module.exports.raw_file = function (req, res) {
    var filepath = req.params.path,
        filename = req.params.filename,
        fullpath = path.join(config.files.raw_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendfile(fullpath);
        }
        else {
            res.send(404, 'Not found');
        }
    });
};
