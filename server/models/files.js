var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = require('../models').schema,
    _ = require('underscore');

var FileSchema = new mongoose.Schema({
    filename: {type: String, trim: true, required: true},
    caption: {type: String, trim: true},
    path: {type: String, trim: true, required: true},
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

var set_tags = function (tags) {
    if (_.isString(tags)) {
        return _.uniq(_.map(tags.split(","), function (tag) {
            return tag.trim().toLowerCase();
        }));
    }
};

FileSchema.pre('save', function (next) {
    this.permissions = set_permissions(this.permissions.toJSON());
    this.tags = set_tags(this.tags.toString());
    next();
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
