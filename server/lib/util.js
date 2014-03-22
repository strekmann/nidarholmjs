var moment = require('moment'),
    _ = require('underscore'),
    slug = require('slug'),
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

module.exports.h2b64 = function(hex){
    return new Buffer(hex, 'hex').toString('base64').replace('+', '-').replace('/', '_');
};

module.exports.b642h = function(b64){
    return new Buffer(b64.replace('-','+').replace('_','/'), 'base64').toString('hex');
};

module.exports.slug = function (text) {
    return slug(text.toLowerCase());
};
module.exports.isodate = function(date) {
    if (date) {
        return moment(date).format();
    }
};

module.exports.shortdate = function (date) {
    if (date) {
        return moment(date).format('ll');
    } else {
        return date;
    }
};

module.exports.longdate = function (date) {
    if (date) {
        return moment(date).format('LLL');
    }
};

module.exports.ago = function (date) {
    if (date) {
        return moment(date).fromNow();
    }
};

module.exports.upload_file = function (tmp_path, filename, prefix, user, permissions, tags, callback) {
    fs.readFile(tmp_path, function (err, data) {
        var shasum, hex, new_dir, new_symlink, new_file, lookup_path;

        var magic = new Magic(mmm.MAGIC_MIME_TYPE);

        magic.detectFile(tmp_path, function(err, mimetype) {
            if (err) { throw err; }

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
                    fs.unlink(tmp_path);
                    fs.symlink(new_file, new_symlink, function (err) {

                        // 47: Already exists
                        if (err && err.errno !== 47) {
                            res.json(500, { error: err });
                        }
                        var file = new File();
                        file.filename = filename;
                        file.path = lookup_path;
                        file.mimetype = mimetype;
                        file.creator = user;
                        if (permissions) {
                            file.permissions = permissions;
                        }
                        _.each(tags, function (tag) {
                            file.tags.push(tag);
                        });
                        file.save(function (err) {
                            callback(err, file);
                        });
                    });
                });
            });
        });
    });
};
