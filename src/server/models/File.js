import path from "path";

import mongoose from "mongoose";
import moment from "moment";
import uuid from "node-uuid";

import schemaOptions from "./schemaOptions";

const FileSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: uuid.v4 },
  filename: { type: String, trim: true, required: true },
  hash: { type: String, required: true },
  created: { type: Date, default: Date.now },
  creator: { type: String, ref: "User" },
  mimetype: { type: String },
  size: { type: Number },
  permissions: {
    groups: [{ type: String, ref: "Group" }],
    users: [{ type: String, ref: "User" }],
    public: { type: Boolean, default: false },
  },
  tags: [{ type: String }],
});

FileSchema.virtual("is_image").get(function isImage() {
  if (this.mimetype && this.mimetype.match(/^image\/(png|jpeg|gif)/)) {
    return true;
  }
  return false;
});

FileSchema.virtual("path").get(function filePath() {
  if (this.hash && this.filename) {
    // useful until implementation stabilizes
    return path.join("/files/o", this.hash, this.filename);
  }
  return null;
});

FileSchema.virtual("large_path").get(function largePath() {
  if (this.hash && this.filename) {
    // useful until implementation stabilizes
    return path.join("/files/l", this.hash, this.filename);
  }
  return null;
});

FileSchema.virtual("normal_path").get(function normalPath() {
  if (this.hash && this.filename) {
    // useful until implementation stabilizes
    return path.join("/files/n", this.hash, this.filename);
  }
  return null;
});

FileSchema.virtual("thumbnail_path").get(function thumbnailPath() {
  if (this.hash && this.filename) {
    // useful until implementation stabilizes
    return path.join("/files/th", this.hash, this.filename);
  }
  return null;
});

FileSchema.virtual("shortdate").get(function shortdate() {
  return moment(this.created).format("LL");
});

FileSchema.virtual("_type").get(() => {
  return "File";
});
FileSchema.set("toObject", schemaOptions);
FileSchema.set("toJSON", schemaOptions);
export default mongoose.model("File", FileSchema);
