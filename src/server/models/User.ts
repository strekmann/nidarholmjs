import crypto from "crypto";

import mongoose from "mongoose";
import { v4 } from "uuid";

import schemaOptions from "./schemaOptions";

export interface IUser extends mongoose.Document {
  _id: string;
  username: string;
  name: string;
  email?: string;
  password?: string;
  algorithm?: string;
  salt?: string;
  groups?: string[];
  friends?: string[];
  is_active?: boolean;
  is_admin?: boolean;
  created: Date;
  nmf_id?: string;
  facebook_id?: string;
  google_id?: string;
  twitter_id?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  city?: string;
  country?: string;
  born?: Date;
  joined?: Date;
  instrument?: string;
  insrument_insurance?: boolean;
  reskontro?: string;
  membership_history?: string;
  profile_picture?: string;
  profile_picture_path?: string;
  membership_status?: number;
  in_list: boolean;
  on_leave: boolean;
  no_email: boolean;
  hashPassword: (
    password: string,
  ) => { hashedPassword: string; algorithm: string; salt: string };
}

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: v4,
  },
  username: {
    type: String,
    lowercase: true,
    trim: true,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  email: { type: String },
  password: { type: String, select: false },
  algorithm: { type: String, select: false },
  salt: { type: String, select: false },
  groups: [{ type: String, ref: "Group" }],
  friends: [{ type: String, ref: "User" }],
  is_active: { type: Boolean, default: true }, // just for blocking users
  is_admin: { type: Boolean, default: false },
  created: { type: Date, required: true, default: Date.now },
  nmf_id: { type: String, select: false },
  facebook_id: {
    type: String,
    unique: true,
    sparse: true,
    select: false,
  },
  google_id: {
    type: String,
    unique: true,
    sparse: true,
    select: false,
  },
  twitter_id: {
    type: String,
    unique: true,
    sparse: true,
    select: false,
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
  profile_picture: { type: String, ref: "File" },
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

UserSchema.methods.authenticate = function authenticateUser(
  candidatePassword: string,
) {
  const user = this;
  return new Promise((resolve) => {
    if (!user.password) {
      resolve(false);
    }
    const hashedPassword = crypto.createHash(this.algorithm);
    hashedPassword.update(this.salt);
    hashedPassword.update(candidatePassword);
    if (user.password === hashedPassword.digest("hex")) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

UserSchema.methods.hashPassword = function hashPassword(
  candidatePassword: string,
) {
  const algorithm = "sha256";
  const salt = crypto.randomBytes(128).toString("base64");
  const hashedPassword = crypto.createHash(algorithm);
  hashedPassword.update(salt);
  hashedPassword.update(candidatePassword);
  return {
    algorithm,
    hashedPassword: hashedPassword.digest("hex"),
    salt,
  };
};

UserSchema.set("toJSON", schemaOptions);
UserSchema.set("toObject", schemaOptions);
UserSchema.virtual("_type").get(() => {
  return "User";
});
export default mongoose.model<IUser>("User", UserSchema);
