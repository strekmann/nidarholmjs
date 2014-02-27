var mongoose = require('mongoose'),
    schema = require('../models').schema;

var EventSchema = new mongoose.Schema({
    title: {type: String, trim: true, required: true},
    start: {type: Date, required: true},
    end: {type: Date},
    // whole_day needed? from nidarholm
    location: {type: String},
    permissions: {
        groups: [schema.GroupSchema],
        users: [schema.UserSchema],
        broadcast: {type: Boolean, default: false}
    },
    tags: [{type: String}],
    creator: {type: String, ref: 'User', required: true},
    created: {type: Date, default: Date.now},
    music: [{
        title: {type: String, required: true},
        part: {type: String},
        composer: {type: String},
        arrangers: [{ type: String }],
        contributors: [{
            name: {type: String},
            role: {type: String}
        }]
    }],
    contributors: [{
        name: {type: String},
        role: {type: String}
    }],
    mdtext: {type: String}
});

var ProjectSchema = new mongoose.Schema({
    title: {type: String, required: true},
    tag: {type: String, required: true},
    public_mdtext: {type: String},
    private_mdtext: {type: String},
    start: {type: Date},
    end: {type: Date, required: true},
    creator: {type: String, ref: 'user', required: true},
    created: {type: Date, default: Date.now},
    permissions: {
        users: [schema.UserSchema],
        groups: [schema.GroupSchema],
        broadcast: {type: Boolean, default: false}
    },
    contributors: [{
        user: {type: String, ref: 'User'},
        role: {type: String}
    }]
});

module.exports = {
    Event: mongoose.model('Event', EventSchema),
    Project: mongoose.model('Project', ProjectSchema)
};
