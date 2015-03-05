var mongoose = require('mongoose');

var PieceSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    title: {type: String, trim: true, required: true},
    subtitle: {type: String, trim: true},
    //part: {type: String, trim: true},
    composers: [{type: String, trim: true}],
    arrangers: [{type: String, trim: true}],
    scores: [{type: String, ref: 'File'}],
    unique_number: {type: Number},
    record_number: {type: Number},
    archive_number: {type: Number},
    band_setup: {type: String},
    short_genre: {type: String},
    genre: {type: String},
    published: {type: String},
    acquired: {type: String},
    concerts: {type: String},
    maintenance_status: {type: String},
    nationality: {type: String},
    difficulty: {type: Number},
    publisher: {type: String},
    import_id: {type: Number},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User', required: true}
});

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
    music: [{
        piece: {type: String, ref: 'Piece'},
        parts: {type: String, trim: true}, // parts played
        // not in use
        contributors: [{ // add a field for userid later?
            name: {type: String},
            role: {type: String}
        }]
    }],
    permissions: {
        groups: [{type: String, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    contributors: [{
        user: {type: String, ref: 'User'},
        role: {type: String}
    }],
    poster: {type: String, ref: 'File'},
    original_project_users: [{type: String, ref: 'User'}],
    conductors: [{type: String, ref: 'User'}],
    managers: [{type: String, ref: 'User'}]
});

module.exports = {
    Piece: mongoose.model('Piece', PieceSchema),
    Event: mongoose.model('Event', EventSchema),
    Project: mongoose.model('Project', ProjectSchema)
};
