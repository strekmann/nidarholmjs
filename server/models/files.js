var mongoose = require('mongoose'),
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
        return path.join(config.files.url_prefix, this.hash, this.filename);
    }
});

FileSchema.set('toJSON', {
    virtuals: true
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
