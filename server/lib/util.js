var moment = require('moment'),
    _ = require('underscore'),
    slug = require('slug'),
    uslug = require('uslug'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    exec = require('child_process').exec,
    async = require('async'),
    marked = require('marked'),
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
    }
    return date;
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

module.exports.daterange = function (start, end) {
    var startm, endm, startd, endd;
    if (start && end) {
        startm = moment(start);
        endm = moment(end);
        startd = moment(start).startOf('day');
        endd = moment(end).startOf('day');
        if (startm.isSame(endm, 'day')) {
            // same day
            if (startm.isSame(startd) && endm.isSame(endd)) {
                return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
            }
            return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
        }
        // saving dates should always set startOf('day') AND later wholeday
        if (startm.isSame(startd) && endm.isSame(endd)) {
            return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
        }
        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('LLL') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
    }
    if (start) {
        // only start
        startm = moment(start);
        startd = moment(startm).startOf('day');
        if (startm.isSame(startd, 'second')) {
            return '<time datetime="' + startm.format() + '">' + startm.format('LL') + '</time>';
        }
        return '<time datetime="' + startm.format() + '">' + startm.format('LLL') + '</time>';
    }
    if (end) {
        // only end
        endm = moment(end);
        endd = moment(endm).startOf('day');
        if (endm.isSame(endd, 'second')) {
            return '<time datetime="' + endm.format() + '">' + endm.format('LL') + '</time>';
        }
        return '<time datetime="' + endm.format() + '">' + endm.format('LLL') + '</time>';
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

module.exports.snippetify = function (text, wanted_length) {
    if (!wanted_length) {
        wanted_length = 500;
    }
    text = marked(text).replace(/(<([^>]+)>)/ig,"");
    var snippet = text;
    if (text.length > wanted_length) {
        snippet = text.slice(0, wanted_length);

        var last_space = snippet.lastIndexOf(" ");
        snippet = text.slice(0, last_space);

        if (snippet.length < text.length) {
            snippet += "…";
        }
    }
    return snippet;
};

// Fetch postcode from posten's service
module.exports.fetch_city = function (postcode, callback) {
    if (postcode && postcode.match(/\d{4}/)) {
        request
        .get('http://adressesok.posten.no/api/v1/postal_codes.json?postal_code=' + postcode)
        .end(function (error, result) {
            if (error) {
                callback(error);
            }
            else {
                var data = result.body;
                if (data.status !== "ok") {
                    callback("notfound");
                } else {
                    callback(null, data.postal_codes[0].city);
                }
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
module.exports.parse_web_permissions = function (permissions) {
    var perm = {public: false, groups: [], users: []};
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
        var permission = permissions;
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

var generate_thumbnail_for_image = function (hex, filepath, mimetype) {
    var promise = new mongoose.Promise();

    if (mimetype.match(/^image\/(png|jpeg|gif)/)) {
        async.parallel({
            large: function (callback) {
                // generate "large" sized image: 1024x640 max
                var directory = path.join(config.files.large_prefix, hex.substr(0,2), hex.substr(2,2));
                mkdirp(directory, function (err) {
                    if (err) { callback(err); }
                    else {
                        var large_path = path.join(directory, hex);
                        var command = 'convert ' + filepath + ' -resize 1024x640\\> -auto-orient ' + large_path;
                        exec(command, function(err, stdout, stderr) {
                            if (err) {
                                console.error(err, stderr);
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            },
            normal: function (callback) {
                // generate "normal" sized image: 600px wide
                var directory = path.join(config.files.normal_prefix, hex.substr(0,2), hex.substr(2,2));
                mkdirp(directory, function (err) {
                    if (err) { callback(err); }
                    else {
                        var normal_path = path.join(directory, hex);
                        var command = 'convert ' + filepath + ' -resize 600x\\> -auto-orient ' + normal_path;
                        exec(command, function(err, stdout, stderr) {
                            if (err) {
                                console.error(err, stderr);
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            },
            thumbnail: function (callback) {
                // generate thumbnail
                var directory = path.join(config.files.thumbnail_prefix, hex.substr(0,2), hex.substr(2,2));
                mkdirp(directory, function (err) {
                    if (err) { callback(err); }
                    else {
                        var thumbnail_path = path.join(directory, hex);
                        var command = 'convert ' + filepath + ' -resize 220x220^ -gravity center -extent 220x220 -strip -auto-orient ' + thumbnail_path;
                        exec(command, function(err, stdout, stderr) {
                            if (err) {
                                console.error(err, stderr);
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            }
        }, function (err) {
            if (err) {
                promise.error(err);
            }
            else {
                promise.fulfill();
            }
        });
    } else {
        promise.fulfill();
    }
    return promise;
};

var save_file = function (tmp_path, prefix, do_delete) {
    var magic = new Magic(mmm.MAGIC_MIME_TYPE),
        promise = new mongoose.Promise();

    fs.stat(tmp_path, function (err, stats) {
        if (err) { promise.error(err); }
        magic.detectFile(tmp_path, function(err, mimetype) {
            if (err) { promise.error(err); }

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
                    if (exists) {
                        promise.fulfill(hex, mimetype, stats.size);
                    }
                    else {

                        mkdirp(directory, function (err) {
                            if (err) { promise.error(err); }

                            // move file (or copy + unlink)
                            // fs.rename does not work from tmp to other partition
                            var is = fs.createReadStream(tmp_path);
                            var os = fs.createWriteStream(file_path);

                            is.pipe(os);
                            is.on('end',function() {
                                if (do_delete) {
                                    fs.unlinkSync(tmp_path);
                                }

                                generate_thumbnail_for_image(hex, file_path, mimetype).then(function () {
                                    promise.fulfill(hex, mimetype, stats.size);
                                });
                            });
                        });
                    }
                });
            });
        });
    });
    return promise;
};

module.exports.upload_file = function (tmp_path, filename, user, param_options, callback) {
    var options = _.extend({
            prefix: config.files.raw_prefix,
            permissions: {public: false, groups: [], users: []},
            tags: [],
            do_delete: true,
            do_create_duplicates_in_database: true
        }, param_options);

    save_file(tmp_path, options.prefix, options.do_delete).then(function (hex, mimetype, size) {
        File.findOne({filename: filename, hash: hex}, function (err, file) {
            if (err) {
                callback(err);
            }
            if (!file || options.do_create_duplicates_in_database) {
                // save to database
                file = new File();
                file._id = shortid();
                file.hash = hex;
                file.size = size;
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
            }
            else {
                callback(null, file);
            }
        });
    });
};

module.exports.prettyhost = function (url) {
    url = url.replace(/^https?:\/\/(?:www\.)?/, '');
    return url;
};

module.exports.phoneformat = function (number) {
    var original = number;
    number = number.replace(/^\+47/).trim();
    if (number.length === 8) {
        // let's say it's a norwegian number
        if (number.match(/^(?:4|9)/)) {
            // mobile xxx xx xxx
            return number.substr(0, 3) + " " + number.substr(3, 2) + " " + number.substr(5, 3);
        }
        else {
            return number.substr(0, 2) + " " + number.substr(2, 2) + " " + number.substr(4 ,2) + " " + number.substr(6, 2);
        }
    }
    else {
        return original;
    }
};
