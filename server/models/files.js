var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = require('../models').schema,
    _ = require('underscore'),
    path = require('path'),
    config = require('../settings');

var FileSchema = new mongoose.Schema({
    filename: {type: String, trim: true, required: true},
    hash: {type: String, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    mimetype: {type: String},
    permissions: {
        groups: [{type: ObjectId, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    tags: [{type: String}]
});

FileSchema.virtual('is_image').get(function () {
    if (this.mimetype && this.mimetype.match(/^image\/(png|jpeg|gif)/)) {
        return true;
    }
});

FileSchema.virtual('path').get(function () {
    if (this.hash && this.filename) { // useful until implementation stabilizes
        return path.join(config.files.url_prefix, this.hash, this.filename);
    }
});

var set_permissions = function (permissions, callback) {
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

FileSchema.pre('save', function (next) {
    this.permissions = set_permissions(this.permissions.toJSON());

    // this should be OK already if we are using addToSet(x.trim().toLowerCase())
    this.tags = _.uniq(_.map(this.tags, function (tag) {
        return tag.trim().toLowerCase();
    }));
    next();
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
