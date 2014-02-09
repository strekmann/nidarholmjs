var fs = require('fs'),
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
    console.log(req.body);
    var prefix = 'uploaded_files';
    fs.readFile(req.files.file.path, function (err, data) {
        var shasum = crypto.createHash('sha1');
        shasum.update('blob ' + data.length +'%s\0');
        shasum.update(data);
        var hex = shasum.digest('hex');

        var newDir = prefix + '/' + hex.substr(0,2) + '/' + hex.substr(2,2) + '/' + hex;
        if (prefix !== '/') {
            // TODO: Check upon installation / debug that this is writable
            newDir = __dirname + '/../../../' + newDir;
        }
        // filePath is the original
        // newPath is symlink
        var filePath = newDir + '/' + hex;
        var newPath = newDir + '/' + req.files.file.name;
        mkdirp(newDir, function (err) {
            if (err) {
                if (err) {
                    res.json(500, {
                        error: err
                    });
                }
            } else {
                fs.writeFile(filePath, data, function (err) {
                    if (err) {
                        res.json(500, {
                            error: err
                        });
                    }
                    fs.symlink(filePath, newPath, function (err) {
                        console.log(req.files.file.name);
                        console.log(filePath);
                        console.log(newPath);
                        console.log(hex);
                        console.log(req.files.file.headers['content-type']);
                        console.log(req.files.file.size);
                        if (err && err.errno !== 47) {
                            res.json(500, {
                                error: err
                            });
                        }
                        res.json(200, {
                            status: "success"
                        });
                    });
                });
            }
        });
    });
};
