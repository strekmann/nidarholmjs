var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    schema = require('../models').schema;

var FileSchema = new mongoose.Schema({
    filename: {type: String, trim: true, required: true},
    caption: {type: String, trim: true},
    path: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    permissions: {
        groups: [{type: ObjectId, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    tags: [{type: String}]
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
