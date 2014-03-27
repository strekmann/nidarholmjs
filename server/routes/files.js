var _ = require('underscore'),
    path = require('path'),
    mongoose = require('mongoose'),
    util = require('../lib/util'),
    config = require('../settings'),
    File = require('../models/files').File;

module.exports.index = function (req, res) {
    var query = File.find().or([
        {creator: req.user},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ])
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
                res.render('files/index', {files: files});
            },
            json: function () {
                res.json(200, files);
            }
        });
    });
};

module.exports.upload = function (req, res) {
    var filename = req.files.file.originalname,
        tmp_path = req.files.file.path,
        user = req.user,
        prefix = config.files.path_prefix,
        permissions = util.parse_web_permissions(req.body.permissions),
        tags = req.body.tags;

    util.upload_file(tmp_path, filename, prefix, user, permissions, tags, function (err, file) {
        if (err) { throw err; }
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
        res.json(200, file);
    });
};

module.exports.show_file = function (req, res) {
    File.findById(req.params.id, function (err, file) {
        res.render('files/show_file', {file: file});
    });
};

module.exports.raw_file = function (req, res) {
    var filepath = req.params.path,
        filename = req.params.filename;

    res.sendfile(path.join(config.files.path_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath));
};
