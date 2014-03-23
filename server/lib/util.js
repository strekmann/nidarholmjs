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
    var magic = new Magic(mmm.MAGIC_MIME_TYPE);

    magic.detectFile(tmp_path, function(err, mimetype) {
        if (err) { throw err; }

        var hash = crypto.createHash('sha1');
        var stream = fs.createReadStream(tmp_path);
        stream.on('data', function (data) {
            hash.update(data);
        });

        stream.on('end', function () {
            var hex = hash.digest('hex');

            // compute paths
            if (prefix[0] !== '/') {
                prefix = path.join(__dirname, '..', '..', prefix);
            }

            var directory = path.join(prefix, hex.substr(0,2), hex.substr(2,2));
            var file_path = path.join(directory, hex);

            // make sure directories exists
            mkdirp(directory, function (err) {
                if (err) { throw err; }

                // move file (or copy + unlink)
                // fs.rename does not work from tmp to other partition
                var is = fs.createReadStream(tmp_path);
                var os = fs.createWriteStream(file_path);

                is.pipe(os);
                is.on('end',function() {
                    fs.unlinkSync(tmp_path);

                    // save to database
                    var file = new File();
                    file.hash = hex;
                    file.filename = filename;
                    file.mimetype = mimetype;
                    file.creator = user;
                    if (permissions) {
                        file.permissions = permissions;
                    }
                    if (tags) {
                        _.each(tags.split(","), function (tag) {
                            file.tags.addToSet(tag.trim().toLowerCase());
                        });
                    }
                    file.save(function (err) {
                        callback(err, file);
                    });
                });
            });
        });
    });
};
