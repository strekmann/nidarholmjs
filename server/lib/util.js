var moment = require('moment'),
    _ = require('underscore'),
    slug = require('slug'),
    uslug = require('uslug'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    shortid = require('short-mongo-id'),
    request = require('superagent'),
    mmm = require('mmmagic'),
    Magic = mmm.Magic,
    config = require('../settings'),
    File = require('../models/files').File;

module.exports.slug = function (text) {
    return slug(text.toLowerCase());
};

module.exports.isodate = function(date) {
    if (date) {
        return moment(date).format();
    }
};
module.exports.simpledate = function(date) {
    if (date) {
        return moment(date).format("YYYY-MM-DD");
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

// lowercases words, removes spaces and punctuation to avoid tag duplicates
var normalize = function (string) {
    return uslug(string, {allowedChars: '-'}).replace(/-/g, '');
};
module.exports.normalize = normalize;

module.exports.tagify = function (tagstring) {
    return _.map(tagstring.split(","), function (tag) {
        return normalize(tag);
    });
};

// Fetch postcode from posten's service
module.exports.fetch_city = function (postcode, callback) {
    if (postcode && postcode.match(/\d{4}/)) {
        request
            .get('http://adressesok.posten.no/api/v1/postal_codes.json?postal_code=' + postcode)
            .end(function (error, result) {
                var data = result.body;
                if (data.status !== "ok") {
                    callback("notfound");
                } else {
                    callback(null, data.postal_codes[0].city);
                }
        });
    } else {
        callback("notvalid");
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
                            file._id = shortid();
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
                    if (!options.do_create_duplicates_in_database) {
                        File.findOne({filename: filename, hash: hex}, function (err, file) {
                            callback(err, file);
                        });
                    } else {
                        callback(new Error('File already exists'), null);
                    }
                }
            });
        });
    });
};
