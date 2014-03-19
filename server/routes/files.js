var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    ObjectId = mongoose.Types.ObjectId,
    mmm = require('mmmagic'),
    Magic = mmm.Magic,
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
    // TODO: config param
    var filename = req.files.file.originalname,
        tmp_path = req.files.file.path,
        prefix = config.files.path_prefix;

    fs.readFile(tmp_path, function (err, data) {
        var shasum, hex, new_dir, new_symlink, new_file, lookup_path;

        var magic = new Magic(mmm.MAGIC_MIME_TYPE);

        magic.detectFile(tmp_path, function(err, mimetype) {
            if (err) throw err;

            shasum = crypto.createHash('sha1');
            shasum.update('blob ' + data.length +'%s\0');
            shasum.update(data);
            hex = shasum.digest('hex');

            new_dir = path.join(prefix, hex.substr(0,2), hex.substr(2,2), hex);
            if (prefix[0] !== '/') {
                // TODO: Check upon installation / debug that this is writable
                new_dir = path.join(__dirname, '..', '..', new_dir);
            }
            new_file = path.join(new_dir, hex);
            new_symlink = path.join(new_dir, filename);

            // for database
            lookup_path = path.join(hex, filename);

            mkdirp(new_dir, function (err) {
                if (err) { throw err; }
                fs.writeFile(new_file, data, function (err) {
                    if (err) { throw err; }
                    fs.unlink(req.files.file.path);
                    fs.symlink(new_file, new_symlink, function (err) {

                        // 47: Already exists
                        if (err && err.errno !== 47) {
                            res.json(500, { error: err });
                        }
                        var file = new File();
                        file.filename = filename;
                        file.path = lookup_path;
                        file.mimetype = mimetype;
                        file.creator = req.user;
                        file.save(function (err) {
                            if (err) { throw err; }
                            res.json(200, {
                                status: "success"
                            });
                        });
                    });
                });
            });
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
