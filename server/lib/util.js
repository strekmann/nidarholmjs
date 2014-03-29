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

// takes permission object from chosen, and converts it to what the database
// expects. Input is an array or string of p, g-id or u-id strings.
// Was trying to do this in pre-save, but mongoose should get the kind of
// objects it expects, or it gets too magic.
module.exports.parse_web_permissions = function (permissions, callback) {
    perm = {public: false, groups: [], users: []};
    if (_.isArray(permissions)) {
        _.each(permissions, function (permission) {
            if (permission === "p") {
                perm.public = true;
            } else {
                var type_id = permission.split("-"),
                    type = type_id[0],
                    id = type_id[1];

                if (type === "g") {
                    perm.groups.push(id);
                } else if (type === "u") {
                    perm.users.push(id);
                }
            }
        });
    } else if (_.isString(permissions)) {
        permission = permissions;
        if (permission === "p") {
            perm.public = true;
        } else {
            var type_id = permission.split("-"),
                type = type_id[0],
                id = type_id[1];

            if (type === "g") {
                perm.groups.push(id);
            } else if (type === "u") {
                perm.users.push(id);
            }
        }
    }
    return perm;
};

module.exports.upload_file = function (tmp_path, filename, user, param_options, callback) {
    var magic = new Magic(mmm.MAGIC_MIME_TYPE),
        options = _.extend({
            prefix: config.files.path_prefix,
            permissions: {public: false, groups: [], users: []},
            tags: [],
            do_delete: true,
            do_create_duplicates_in_database: true
        }, param_options),
        prefix = options.prefix;

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

            fs.exists(file_path, function (exists) {
                if (!exists || options.do_create_duplicates_in_database) {

                    // make sure directories exists
                    mkdirp(directory, function (err) {
                        if (err) { throw err; }

                        // move file (or copy + unlink)
                        // fs.rename does not work from tmp to other partition
                        var is = fs.createReadStream(tmp_path);
                        var os = fs.createWriteStream(file_path);

                        is.pipe(os);
                        is.on('end',function() {
                            if (options.do_delete) {
                                fs.unlinkSync(tmp_path);
                            }

                            // save to database
                            var file = new File();
                            file.hash = hex;
                            file.filename = filename;
                            file.mimetype = mimetype;
                            file.creator = user;
                            if (options.permissions) {
                                file.permissions = options.permissions;
                            }
                            if (options.tags) {
                                _.each(options.tags, function (tag) {
                                    file.tags.addToSet(tag.trim().toLowerCase());
                                });
                            }
                            file.save(function (err) {
                                callback(err, file);
                            });
                        });
                    });
                } else {
                    callback(new Error('File already exists'), null);
                }
            });
        });
    });
};
