var mongoose = require('mongoose'),
    schema = require('../models').schema;

var FileSchema = new mongoose.Schema({
    filename: {type: String, trim: true, required: true},
    caption: {type: String, trim: true},
    path: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    permissions: {
        groups: {type: [GroupSchema], sparse: true},
        users: {type: [UserSchema], sparse: true},
        broadcast: {type: Boolean, default: false}
    },
    tags: [{type: String}]
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
