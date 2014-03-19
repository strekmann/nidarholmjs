var _ = require('underscore'),
    path = require('path'),
    mongoose = require('mongoose'),
    upload_file = require('../lib/util').upload_file,
    config = require('../settings'),
    File = require('../models/files').File;

module.exports.all = function (req, res) {
    File.find().or([
        {creator: req.user},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ]).exec(function (err, files) {
        if (err) {
            throw err;
        }
        res.format({
            html: function () {
                files = _.map(files, function (file) {
                    file.path = path.join(config.files.url_prefix, file.path);
                    return file;
                });
                res.render('files/index', {files: files});
            },
            json: function () {
                res.json(200, files);
            }
        });
    });
};

module.exports.index = function (req, res) {
    res.render('files/index');
};

module.exports.upload = function (req, res) {
    //console.log(req.body);
    //console.log(req.files);
    var filename = req.files.file.originalname,
        tmp_path = req.files.file.path,
        user = req.user,
        prefix = config.files.path_prefix,
        permissions,
        tags;

    upload_file(tmp_path, filename, prefix, user, permissions, tags, function (err, file) {
        if (err) { throw err; }
        res.json(200, {
            status: "success"
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

module.exports.show_file = function (req, res) {
    var id;

    File.findById(req.params.id, function (err, file) {
        res.render('files/show_file', {file: file});
    });
};

module.exports.raw_file = function (req, res) {
    var filepath = req.params.path,
        filename = req.params.filename;

    res.sendfile(filename, {root: path.join(config.files.path_prefix, filepath.substr(0,2), filepath.substr(2,2), filepath)});
};
