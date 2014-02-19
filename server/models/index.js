var mongoose = require('mongoose');

var GroupSchema = new mongoose.Schema({
    name: {type: String, trim: true, required: true},
    organization: {type: String, ref: 'Organization'},
    members: [{_id: {type: String, ref: 'User'}, role: {type: String, trim: true}}],
    group_email: {type: String, lowercase: true, trim: true},
    group_leader_email: {type: String, lowercase: true, trim: true}
});

var UserSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    username: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String},
    password: {type: String},
    algorithm: {type: String},
    salt: {type: String},
    groups: [GroupSchema],
    is_active: {type: Boolean, 'default': true},
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    google_id: {type: String}
});

var OrganizationSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    instrument_groups: [GroupSchema],
    administration_groups: [GroupSchema],
    member_group: {type: String, ref: 'Group'},
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
