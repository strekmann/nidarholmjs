var mongoose = require('mongoose'),
    User = require('../models').User;

var FileSchema = new mongoose.Schema({
    title: {type: String, trim: true, required: true},
    filename: {type: String, trim: true, required: true},
    path: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'}
});

module.exports = {
    File: mongoose.model('File', FileSchema)
};
