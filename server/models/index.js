var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId,
    config = require('../settings');

var GroupSchema = new mongoose.Schema({
    name: {type: String, trim: true, required: true},
    organization: {type: String, ref: 'Organization'},
    members: [{user: {type: String, ref: 'User'}, role: {type: String, trim: true}}],
    group_email: {type: String, lowercase: true, trim: true},
    group_leader_email: {type: String, lowercase: true, trim: true},
    old_id: {type: Number}
});

var UserSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    username: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    algorithm: {type: String},
    salt: {type: String},
    groups: [{type: ObjectId, ref: 'Group'}],
    friends: [{type: String, ref: 'User'}],
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: String},
    nmf_id: {type: String},
    phone: {type: String},
    address: {type: String},
    postcode: {type: String},
    city: {type: String},
    country: {type: String},
    born: {type: Date},
    joined: {type: Date},
    instrument: {type: String},
    instrument_insurance: {type: Boolean},
    reskontro: {type: String},
    membership_history: {type: String},
    profile_picture: {type: String, ref: 'File'},
    profile_picture_path: {type: String}
});

var OrganizationSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    instrument_groups: [{type: ObjectId, ref: 'Group'}],
    administration_groups: [{type: ObjectId, ref: 'Group'}],
    member_group: {type: ObjectId, ref: 'Group'},
});

module.exports = {
    schema: {
        user: UserSchema,
        group: GroupSchema
    },
    User: mongoose.model('User', UserSchema),
    Group: mongoose.model('Group', GroupSchema),
    Organization: mongoose.model('Organization', OrganizationSchema)
};
