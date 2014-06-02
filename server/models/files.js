var mongoose = require('mongoose'),
    moment = require('moment'),
    schema = require('../models').schema,
    _ = require('underscore'),
    path = require('path'),
    shortid = require('short-mongo-id'),
    config = require('../settings');

var FileSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    filename: {type: String, trim: true, required: true},
    hash: {type: String, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    mimetype: {type: String},
    permissions: {
        groups: [{type: String, ref: 'Group'}],
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
        return path.join('/files', this.hash, this.filename);
    }
});

FileSchema.virtual('picture_path').get(function () {
    if (this.hash && this.filename) { // useful until implementation stabilizes
        return path.join('/files/picture', this.hash, this.filename);
    }
});

FileSchema.virtual('thumbnail_path').get(function () {
    if (this.hash && this.filename) { // useful until implementation stabilizes
        return path.join('/files/thumbnail', this.hash, this.filename);
    }
});

FileSchema.virtual('shortdate').get(function () {
    return moment(this.created).format('LL');
});

FileSchema.set('toJSON', {
    virtuals: true
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
