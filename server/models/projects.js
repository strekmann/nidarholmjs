var mongoose = require('mongoose'),
    schema = require('../models').schema;

var EventSchema = new mongoose.Schema({
    title: {type: String, trim: true, required: true},
    start: {type: Date, required: true},
    end: {type: Date},
    // whole_day needed? from nidarholm
    original_whole_day: {type: Boolean, default: false},
    original_event_serie: {type: Number},
    original_event_category: {type: Number},
    location: {type: String},
    permissions: {
        groups: [{type: String, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    tags: [{type: String}],
    creator: {type: String, ref: 'User', required: true},
    created: {type: Date, default: Date.now},
    modified: {type: Date},
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
    //_id: {type: String, lowercase: true, required: true, unique: true, trim: true},
    tag: {type: String, trim: true, required: true},
    title: {type: String, required: true},
    public_mdtext: {type: String},
    private_mdtext: {type: String},
    start: {type: Date},
    end: {type: Date, required: true},
    year: {type: Number, required: true, index: true}, // end.year
    creator: {type: String, ref: 'User', required: true},
    created: {type: Date, default: Date.now},
    permissions: {
        groups: [{type: String, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    contributors: [{
        user: {type: String, ref: 'User'},
        role: {type: String}
    }],
    original_project_users: [{type: String, ref: 'User'}]
});

module.exports = {
    Event: mongoose.model('Event', EventSchema),
    Project: mongoose.model('Project', ProjectSchema)
};
