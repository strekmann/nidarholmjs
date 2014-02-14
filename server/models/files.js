var mongoose = require('mongoose'),
    User = require('../models').User,
    schema = require('../models').schema;

var FileSchema = new mongoose.Schema({
    filename: {type: String, trim: true, required: true},
    caption: {type: String, trim: true},
    path: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    permissions: {
        users: [schema.UserSchema],
        groups: [schema.GroupSchema],
        broadcast: {type: Boolean, default: false}
    }
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
