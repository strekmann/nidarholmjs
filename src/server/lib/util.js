let moment = require('moment'),
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
    config = require('config'),
    File = require('../models/files').File;

module.exports.slug = function (text) {
    return slug(text.toLowerCase());
};

module.exports.isodate = function (date) {
    if (date) {
        return moment(date).format();
    }
};
module.exports.simpledate = function (date) {
    if (date) {
        return moment(date).format('YYYY-MM-DD');
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
    let startm, endm, startd, endd;
    if (start && end) {
        startm = moment(start);
        endm = moment(end);
        startd = moment(start).startOf('day');
        endd = moment(end).startOf('day');
        if (startm.isSame(endm, 'day')) {
            // same day
            if (startm.isSame(startd) && endm.isSame(endd)) {
                return '<time class="start" datetime="' + startm.format() + '">' + startm.format('ll') + '</time>';
            }
            return '<time class="start" datetime="' + startm.format() + '">' + startm.format('lll') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('LT') + '</time>';
        }
        // saving dates should always set startOf('day') AND later wholeday
        if (startm.isSame(startd) && endm.isSame(endd)) {
            return '<time class="start" datetime="' + startm.format() + '">' + startm.format('ll') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('ll') + '</time>';
        }
        return '<time class="start" datetime="' + startm.format() + '">' + startm.format('lll') + '</time> – <time class="end" datetime="' + endm.format() + '">' + endm.format('lll') + '</time>';
    }
    if (start) {
        // only start
        startm = moment(start);
        startd = moment(startm).startOf('day');
        if (startm.isSame(startd, 'second')) {
            return '<time datetime="' + startm.format() + '">' + startm.format('ll') + '</time>';
        }
        return '<time datetime="' + startm.format() + '">' + startm.format('lll') + '</time>';
    }
    if (end) {
        // only end
        endm = moment(end);
        endd = moment(endm).startOf('day');
        if (endm.isSame(endd, 'second')) {
            return '<time datetime="' + endm.format() + '">' + endm.format('ll') + '</time>';
        }
        return '<time datetime="' + endm.format() + '">' + endm.format('lll') + '</time>';
    }
};

// lowercases words, removes spaces and punctuation to avoid tag duplicates
const normalize = function (string) {
    return uslug(string, { allowedChars: '-' }).replace(/-/g, '');
};
module.exports.normalize = normalize;

module.exports.tagify = function (tagstring) {
    return _.map(tagstring.split(','), (tag) => {
        return normalize(tag);
    });
};

module.exports.snippetify = function (text, wanted_length) {
    if (!wanted_length) {
        wanted_length = 500;
    }
    text = marked(text).replace(/(<([^>]+)>)/ig, '');
    let snippet = text;
    if (text.length > wanted_length) {
        snippet = text.slice(0, wanted_length);

        const last_space = snippet.lastIndexOf(' ');
        snippet = text.slice(0, last_space);

        if (snippet.length < text.length) {
            snippet += '…';
        }
    }
    return snippet;
};

// Fetch postcode from posten's service
module.exports.fetch_city = function (postcode, callback) {
    if (postcode && postcode.match(/\d{4}/)) {
        request
        .get('http://adressesok.posten.no/api/v1/postal_codes.json?postal_code=' + postcode)
        .end((error, result) => {
            if (error) {
                callback(error);
            }
            else {
                const data = result.body;
                if (data.status !== 'ok') {
                    callback('notfound');
                } else {
                    callback(null, data.postal_codes[0].city);
                }
            }
        });
    } else {
        callback('notvalid');
    }
};

// takes permission object from chosen, and converts it to what the database
// expects. Input is an array or string of p, g-id or u-id strings.
// Was trying to do this in pre-save, but mongoose should get the kind of
// objects it expects, or it gets too magic.
module.exports.parse_web_permissions = function (permissions) {
    const perm = { public: false, groups: [], users: [] };
    if (_.isArray(permissions)) {
        _.each(permissions, (permission) => {
            if (permission === 'p') {
                perm.public = true;
            } else {
                let type_id = permission.split('-'),
                    type = type_id[0],
                    id = type_id[1];

                if (type === 'g') {
                    perm.groups.push(id);
                } else if (type === 'u') {
                    perm.users.push(id);
                }
            }
        });
    } else if (_.isString(permissions)) {
        const permission = permissions;
        if (permission === 'p') {
            perm.public = true;
        } else {
            let type_id = permission.split('-'),
                type = type_id[0],
                id = type_id[1];

            if (type === 'g') {
                perm.groups.push(id);
            } else if (type === 'u') {
                perm.users.push(id);
            }
        }
    }
    return perm;
};

const generate_thumbnail_for_image = function (hex, filepath, mimetype) {
    return new Promise(
        (resolve, reject) => {
            if (mimetype.match(/^image\/(png|jpeg|gif)/)) {
                async.parallel({
                    large(callback) {
                        // generate "large" sized image: 1024x640 max
                        const directory = path.join(config.files.large_prefix, hex.substr(0, 2), hex.substr(2, 2));
                        mkdirp(directory, (err) => {
                            if (err) { callback(err); }
                            else {
                                const large_path = path.join(directory, hex);
                                const command = 'convert ' + filepath + ' -resize 1024x640\\> -auto-orient ' + large_path;
                                exec(command, (err, stdout, stderr) => {
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
                    normal(callback) {
                        // generate "normal" sized image: 600px wide
                        const directory = path.join(config.files.normal_prefix, hex.substr(0, 2), hex.substr(2, 2));
                        mkdirp(directory, (err) => {
                            if (err) { callback(err); }
                            else {
                                const normal_path = path.join(directory, hex);
                                const command = 'convert ' + filepath + ' -resize 600x\\> -auto-orient ' + normal_path;
                                exec(command, (err, stdout, stderr) => {
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
                    thumbnail(callback) {
                        // generate thumbnail
                        const directory = path.join(config.files.thumbnail_prefix, hex.substr(0, 2), hex.substr(2, 2));
                        mkdirp(directory, (err) => {
                            if (err) { callback(err); }
                            else {
                                const thumbnail_path = path.join(directory, hex);
                                const command = 'convert ' + filepath + ' -resize 220x220^ -gravity center -extent 220x220 -strip -auto-orient ' + thumbnail_path;
                                exec(command, (err, stdout, stderr) => {
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
                }, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            }
            else {
                resolve();
            }
        });
};

module.exports.save_file = function save_file(tmp_path, prefix, do_delete = true) {
    const magic = new Magic(mmm.MAGIC_MIME_TYPE);
    return new Promise(
        (resolve, reject) => fs.stat(tmp_path, (err, stats) => {
            if (err) { reject(err); }
            magic.detectFile(tmp_path, (err, mimetype) => {
                if (err) { reject(err); }

                const hash = crypto.createHash('sha1');
                const stream = fs.createReadStream(tmp_path);
                stream.on('data', (data) => {
                    hash.update(data);
                });
                stream.on('end', () => {
                    const hex = hash.digest('hex');

                    // compute paths
                    if (prefix[0] !== '/') {
                        prefix = path.join(__dirname, '..', '..', prefix);
                    }

                    const directory = path.join(prefix, hex.substr(0, 2), hex.substr(2, 2));
                    const file_path = path.join(directory, hex);

                    fs.exists(file_path, (exists) => {
                        if (exists) {
                            resolve({ hex, mimetype, size: stats.size });
                        }
                        mkdirp(directory, (err) => {
                            if (err) { reject(err); }

                            // move file (or copy + unlink)
                            // fs.rename does not work from tmp to other partition
                            const is = fs.createReadStream(tmp_path);
                            const os = fs.createWriteStream(file_path);

                            is.pipe(os);
                            is.on('end', () => {
                                if (do_delete) {
                                    fs.unlinkSync(tmp_path);
                                }

                                generate_thumbnail_for_image(hex, file_path, mimetype).then(() => {
                                    resolve({ hex, mimetype, size: stats.size });
                                });
                            });
                        });
                    });
                });
            });
        })
    );
};

module.exports.insert_file = function insert_file(filename, hex, prefix, user) {
    return new Promise((resolve, reject) => {
        // compute paths
        if (prefix[0] !== '/') {
            prefix = path.join(__dirname, '..', '..', prefix);
        }

        const directory = path.join(prefix, hex.substr(0, 2), hex.substr(2, 2));
        const file_path = path.join(directory, hex);

        const magic = new Magic(mmm.MAGIC_MIME_TYPE);
        fs.stat(file_path, (err, stats) => {
            if (err) { reject(err); }
            magic.detectFile(file_path, (err, mimetype) => {
                if (err) { reject(err); }
                const file = new File({
                    _id: shortid(),
                    filename,
                    hash: hex,
                    mimetype,
                    size: stats.size,
                    creator: user,
                });

                resolve(file.save());
            });
        });
    });
};

module.exports.upload_file = function (tmp_path, filename, user, param_options, callback) {
    const options = _.extend({
        prefix: config.files.raw_prefix,
        permissions: { public: false, groups: [], users: [] },
        tags: [],
        do_delete: true,
        do_create_duplicates_in_database: true,
    }, param_options);

    save_file(tmp_path, options.prefix, options.do_delete).then((hex, mimetype, size) => {
        File.findOne({ filename, hash: hex }, (err, file) => {
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
                    _.each(options.tags, (tag) => {
                        file.tags.addToSet(tag.trim().toLowerCase());
                    });
                }
                file.save((err) => {
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
    const original = number;
    number = number.replace(/^\+47/).trim();
    if (number.length === 8) {
        // let's say it's a norwegian number
        if (number.match(/^(?:4|9)/)) {
            // mobile xxx xx xxx
            return number.substr(0, 3) + ' ' + number.substr(3, 2) + ' ' + number.substr(5, 3);
        }
        else {
            return number.substr(0, 2) + ' ' + number.substr(2, 2) + ' ' + number.substr(4, 2) + ' ' + number.substr(6, 2);
        }
    }
    else {
        return original;
    }
};
