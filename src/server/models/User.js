import crypto from 'crypto';

import mongoose from 'mongoose';
import uuid from 'node-uuid';

import schemaOptions from './schemaOptions';

const UserSchema = new mongoose.Schema({
    _id: {
        type: String, required: true, unique: true, default: uuid.v4,
    },
    username: {
        type: String, lowercase: true, trim: true, required: true, unique: true,
    },
    name: { type: String, required: true },
    email: { type: String },
    password: { type: String, select: false },
    algorithm: { type: String, select: false },
    salt: { type: String, select: false },
    groups: [{ type: String, ref: 'Group' }],
    friends: [{ type: String, ref: 'User' }],
    is_active: { type: Boolean, default: true }, // just for blocking users
    is_admin: { type: Boolean, default: false },
    created: { type: Date, required: true, default: Date.now },
    nmf_id: { type: String, select: false },
    facebook_id: {
        type: String, unique: true, sparse: true, select: false,
    },
    google_id: {
        type: String, unique: true, sparse: true, select: false,
    },
    twitter_id: {
        type: String, unique: true, sparse: true, select: false,
    },
    phone: { type: String },
    address: { type: String },
    postcode: { type: String },
    city: { type: String },
    country: { type: String },
    born: { type: Date },
    joined: { type: Date },
    instrument: { type: String },
    instrument_insurance: { type: Boolean, select: false },
    reskontro: { type: String, select: false },
    membership_history: { type: String, select: false },
    profile_picture: { type: String, ref: 'File' },
    profile_picture_path: { type: String },
    membership_status: { type: Number },
    // from membership_status
    in_list: { type: Boolean, required: true, default: true },
    on_leave: { type: Boolean, required: true, default: false },
    no_email: { type: Boolean, required: true, default: false },
    social_media: {
        website: { type: String },
        blog: { type: String },
        google: { type: String },
        twitter: { type: String },
        facebook: { type: String },
        instagram: { type: String },
    },
});

UserSchema.methods.authenticate = function authenticateUser(candidatePassword) {
    const user = this;
    return new Promise((resolve) => {
        if (!user.password) {
            resolve(false);
        }
        const hashedPassword = crypto.createHash(this.algorithm);
        hashedPassword.update(this.salt);
        hashedPassword.update(candidatePassword);
        if (user.password === hashedPassword.digest('hex')) {
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
};

UserSchema.methods.hashPassword = function hashPassword(candidatePassword) {
    const algorithm = 'sha256';
    const salt = crypto.randomBytes(128).toString('base64');
    const hashedPassword = crypto.createHash(algorithm);
    hashedPassword.update(salt);
    hashedPassword.update(candidatePassword);
    return {
        algorithm,
        hashedPassword: hashedPassword.digest('hex'),
        salt,
    };
};

UserSchema.set('toJSON', schemaOptions);
UserSchema.set('toObject', schemaOptions);
UserSchema.virtual('_type').get(() => {
    return 'User';
});
export default mongoose.model('User', UserSchema);
