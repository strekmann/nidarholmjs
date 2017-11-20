import marked from '8fold-marked';
import mongoose from 'mongoose';

import schemaOptions from './schemaOptions';

const OrganizationSchema = new mongoose.Schema({
    _id: {
        type: String, lowercase: true, trim: true, required: true, unique: true,
    },
    name: { type: String },
    webdomain: { type: String, trim: true },
    instrument_groups: [{ type: String, ref: 'Group' }],
    contact_groups: [{ type: String, ref: 'Group' }], // contacts page
    contactRoles: [{ type: String, ref: 'Role' }],
    administration_group: { type: String, ref: 'Group' }, // temp
    musicscoreadmin_group: { type: String, ref: 'Group' },
    member_group: { type: String, ref: 'Group' },
    contact_text: { type: String, trim: true },
    visitor_address: { type: String, trim: true },
    mail_address: { type: String, trim: true },
    postcode: { type: String, trim: true },
    city: { type: String, trim: true },
    email: { type: String, trim: true },
    organization_number: { type: String, trim: true },
    public_bank_account: { type: String, trim: true },
    map_url: { type: String, trim: true },
    social_media: {
        website: { type: String },
        blog: { type: String },
        google: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        instagram: { type: String },
    },
    description: {}, // mixed hash of locale keys and values
    description_nb: { type: String },
    tracking_code: { type: String },
    summaries: [{ type: String, ref: 'Page' }],
});

OrganizationSchema.virtual('encoded_email').get(function email() {
    const lexer = new marked.InlineLexer([]);
    return lexer.mangle(this.email);
});
OrganizationSchema.virtual('website').get(function website() {
    return this.social_media.website;
});
OrganizationSchema.virtual('twitter').get(function twitter() {
    return this.social_media.twitter;
});
OrganizationSchema.virtual('facebook').get(function facebook() {
    return this.social_media.facebook;
});
OrganizationSchema.virtual('instagram').get(function facebook() {
    return this.social_media.instagram;
});
OrganizationSchema.virtual('_type').get(() => {
    return 'Organization';
});
OrganizationSchema.set('toObject', schemaOptions);
OrganizationSchema.set('toJSON', schemaOptions);

export default mongoose.model('Organization', OrganizationSchema);
