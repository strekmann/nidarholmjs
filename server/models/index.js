var mongoose = require('mongoose'),
    marked = require('marked');

var PasswordCode = new mongoose.Schema({
    _id: {type: String, unique: true, required: true}, //uuid
    user: {type: String, required: true},
    created: {type: Date, required: true, 'default': Date.now}
});

var RememberMeToken = new mongoose.Schema({
    _id: {type: String, unique: true, required: true}, //uuid
    user: {type: String, required: true},
    created: {type: Date, required: true, 'default': Date.now}
});

var GroupSchema = new mongoose.Schema({
    _id: {type: String, unique: true, required: true},
    name: {type: String, trim: true, required: true},
    organization: {type: String, ref: 'Organization'},
    members: [{
        user: {type: String, ref: 'User'},
        role: {
            title: {type: String, trim: true},
            email: {type: String, trim: true}
        }
    }],
    group_email: {type: String, lowercase: true, trim: true},
    group_leader_email: {type: String, lowercase: true, trim: true},
    externally_hidden: {type: Boolean, default: false},
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
    groups: [{type: String, ref: 'Group'}],
    friends: [{type: String, ref: 'User'}],
    is_active: {type: Boolean, 'default': true}, // just for blocking users
    is_admin: {type: Boolean, 'default': false},
    created: {type: Date, required: true, 'default': Date.now},
    nmf_id: {type: String},
    facebook_id: {type: String, unique: true, sparse: true},
    google_id: {type: String, unique: true, sparse: true},
    twitter_id: {type: String, unique: true, sparse: true},
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
    profile_picture_path: {type: String},
    membership_status: {type: Number},
    // from membership_status
    in_list: {type: Boolean, required: true, default: true},
    on_leave: {type: Boolean, required: true, default: false},
    no_email: {type: Boolean, required: true, default: false},
    social_media: {
        website: {type: String},
        blog: {type: String},
        google: {type: String},
        twitter: {type: String},
        facebook: {type: String},
        instagram: {type: String}
    }
});

var OrganizationSchema = new mongoose.Schema({
    _id: {type: String, lowercase: true, trim: true, required: true, unique: true},
    name: {type: String},
    webdomain: {type: String, trim: true},
    instrument_groups: [{type: String, ref: 'Group'}],
    contact_groups: [{type: String, ref: 'Group'}], // contacts page
    administration_group: {type: String, ref: 'Group'}, // temporary. privileges will be split later
    musicscoreadmin_group: {type: String, ref: 'Group'},
    member_group: {type: String, ref: 'Group'},
    contact_text: {type: String, trim: true},
    visitor_address: {type: String, trim: true},
    mail_address: {type: String, trim: true},
    postcode: {type: String, trim: true},
    city: {type: String, trim: true},
    email: {type: String, trim: true},
    organization_number: {type: String, trim: true},
    public_bank_account: {type: String, trim: true},
    map_url: {type: String, trim: true},
    social_media: {
        website: {type: String},
        blog: {type: String},
        google: {type: String},
        twitter: {type: String},
        facebook: {type: String},
        instagram: {type: String}
    },
    description: {}, // mixed hash of locale keys and values
    tracking_code: {type: String}
});

OrganizationSchema.virtual('encoded_email').get(function () {
    return marked('<'+this.email+'>');
});

OrganizationSchema.set('toJSON', {
    virtuals: true
});

var ActivitySchema = new mongoose.Schema({
    content_type: {type: String, required: true},
    content_ids: [{type: String}],
    title: {type: String, required: true},
    project: {type: String, ref: 'Project'},
    tags: [{type: String}],
    content: {}, //mixed
    changes: [{
        changed: {type: Date},
        user: {type: String, ref: 'User'}
    }],
    permissions: {
        groups: [{type: String, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    modified: {type: Date, default: Date.now}
});

module.exports = {
    schema: {
        user: UserSchema,
        group: GroupSchema
    },
    PasswordCode: mongoose.model('PasswordCode', PasswordCode),
    RememberMeToken: mongoose.model('RememberMeToken', RememberMeToken),
    User: mongoose.model('User', UserSchema),
    Group: mongoose.model('Group', GroupSchema),
    Organization: mongoose.model('Organization', OrganizationSchema),
    Activity: mongoose.model('Activity', ActivitySchema)
};
