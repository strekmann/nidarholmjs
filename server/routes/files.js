var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    path = require('path'),
    fs = require('fs'),
    moment= require('moment'),
    util = require('../lib/util'),
    config = require('../settings'),
    is_member = require('../lib/middleware').is_member,
    File = require('../models/files').File,
    Activity = require('../models').Activity;

router.get('/', function (req, res, next) {
    var query;
    if (req.user) {
        query = File.find().or([
            {creator: req.user._id},
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
        if (err) { return next(err); }
        res.format({
            html: function () {
                File.aggregate([
                    {$match: {tags: {$ne: ''}}},
                    {$project: {tags: 1}},
                    {$unwind: '$tags'},
                    {$group: {_id: '$tags', count: {$sum: 1}}},
                    {$sort: {count: -1}},
                    {$limit: 20},
                    {$project: {'_id': 1}}
                ], function (err, tags) {
                    if (err) { return next(err); }
                    res.render('files/index', {files: files, tags: _.map(tags, function (tag) { return tag._id; }), meta: {title: 'Filer'}});
                });
            },
            json: function () {
                res.json(files);
            }
        });
    });
});

router.get('/t/*', function (req, res, next) {
    var tagstring = req.params[0];
    var query;
    if (req.user) {
        query = File.find().or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = File.find({'permissions.public': true});
    }

    _.each(tagstring.split("/"), function (tag) {
        query.find({'tags': tag});
    });
    var tags = tagstring.split("/");

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
                File.aggregate([
                    {$match: {tags: {$in: tags}}},
                    {$project: {tags: 1}},
                    {$unwind: '$tags'},
                    {$match: {tags: {$nin: tags}}},
                    {$group: {_id: '$tags', count: {$sum: 1}}},
                    {$sort: {count: -1}},
                    {$limit: 20},
                    {$project: {'_id': 1}}
                ], function (err, tags) {
                    if (err) { return next(err); }
                    res.format({
                        html: function () {
                            res.render('files/index', {files: files, tags: _.map(tags, function (tag) { return tag._id; }), meta: {title: 'Filer'}});
                        },
                        json: function () {
                            res.json(files);
                        }
                    });
                });
            },
            json: function () {
                res.json(files);
            }
        });
    });
});

router.post('/upload', is_member, function (req, res) {
    var filename = req.files.file.originalname,
        tmp_path = req.files.file.path,
        user = req.user._id,
        tags = req.body.tags;

    if (_.isEmpty(tags)) {
        tags = [];
    }
    else {
        tags = tags.split(',');
    }

    var options = {
            permissions: util.parse_web_permissions(req.body.permissions),
            tags: tags
        };

    util.upload_file(tmp_path, filename, user, options, function (err, file) {
        if (err) { throw err; }

        Activity.findOne({
            content_type: 'upload',
            'changes.user': file.creator,
            modified: {$gt: moment(file.created).subtract(10, 'minutes').toDate()},
            project: {$exists: false}
        }, function (err, activity) {
            if (err) { console.error(err); }

            if (!activity) {
                activity = new Activity();
                activity.content_type = 'upload';
            }

            activity.content_ids.push(file._id);
            activity.title = file.filename;
            activity.changes.push({user: req.user._id, changed: file.created});
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
            activity.save(function (err) {
                if (err) { console.error(err); }
            });
        });

        res.format({
            json: function () {
                file.populate('creator', 'username name', function (err, file) {
                    if (err) { throw err; }
                    res.json(file);
                });
            },
            html: function () {
                res.redirect("/files");
            }
        });
    });
});

router.put('/:id', is_member, function (req, res, next) {
    var id = req.params.id,
        tags = req.body.tags,
        filename = req.body.filename;

    if (_.isEmpty(tags)) {
        tags = [];
    }
    else {
        tags = tags.split(',');
    }

    var query = File.findById(id).or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);

    query.exec(function (err, file) {
        if (err) { return next(err); }

        if (!file) {
            res.status(403).json();
        }

        file.filename = filename;
        file.tags = tags;
        file.save(function (err) {
            if (err) { return next(err); }

            Activity.update({content_ids: id}, {$set: {tags: tags}, title: filename}, function (err) {
                if (err) { console.error(err); }
            });
            res.json(file);
        });
    });
});

router.delete('/:id', function (req, res, next) {
    var id = req.params.id;

    File.findByIdAndRemove(id, function (err, file) {
        if (err) { return next(err); }
        Activity.findOneAndRemove({
            content_type: 'upload', content_id: file._id
        }, function (err) {
            if (err) { console.error(err); }
        });
        res.json(file);
    });
});

router.get('/:id', function (req, res, next) {
    var query = File.findById(req.params.id);
    if (req.user) {
        query = query.or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = query.where('permissions.public', true);
    }
    query.populate('creator', 'name username').exec(function (err, file) {
        if (err) { return next(err); }
        if (!file) {
            res.send(404, 'Not found');
        }
        else {
            res.render('files/show_file', {file: file, meta: {title: file.filename}});
        }
    });
});

router.get('/th/:path/:filename', function (req, res) {
    var filepath = req.params.path,
        //filename = req.params.filename,
        fullpath = path.join(config.files.thumbnail_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

router.get('/n/:path/:filename', function (req, res) {
    var filepath = req.params.path,
        //filename = req.params.filename,
        fullpath = path.join(config.files.normal_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

router.get('/l/:path/:filename', function (req, res) {
    var filepath = req.params.path,
        //filename = req.params.filename,
        fullpath = path.join(config.files.large_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

router.get('/:path/:filename', function (req, res) {
    var filepath = req.params.path,
        //filename = req.params.filename,
        fullpath = path.join(config.files.raw_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath);

    fs.exists(fullpath, function (exists) {
        if (exists) {
            res.sendFile(fullpath);
        }
        else {
            res.sendStatus(404);
        }
    });
});

module.exports = router;
