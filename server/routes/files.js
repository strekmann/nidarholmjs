var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    File = require('../models/files').File;

module.exports.all = function (req, res) {
    File.find({}).exec(function (err, files) {
        if (err) {
            throw err;
        }
        res.json(200, files);
    });
};

module.exports.index = function (req, res) {
    res.render('files/index');
};

module.exports.upload = function (req, res) {
    //console.log(req.body);
    //console.log(req.files);
    // TODO: config param
    var prefix = 'uploaded_files';
    fs.readFile(req.files.file.path, function (err, data) {
        var shasum, hex, new_dir, new_symlink, new_file;

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
        new_symlink = path.join(new_dir, req.files.file.originalname);
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
                    res.json(200, {
                        status: "success"
                    });
                });
            });
        });
    });
};
