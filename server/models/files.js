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

module.exports = {
    File: mongoose.model('File', FileSchema)
};
