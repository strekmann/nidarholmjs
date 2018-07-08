import mongoose from "mongoose";

import schemaOptions from "./schemaOptions";

const PageSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // id
  slug: { type: String, required: true, unique: true },
  mdtext: { type: String, trim: true },
  title: { type: String, trim: true, default: "" },
  summary: { type: String, trim: true, default: "" },
  permissions: {
    groups: [{ type: String, ref: "Group" }],
    users: [{ type: String, ref: "User" }],
    public: { type: Boolean, default: false },
  },
  created: { type: Date, default: Date.now },
  creator: { type: String, ref: "User" },
  updated: { type: Date },
  updator: { type: String, ref: "User" },
});

PageSchema.virtual("_type").get(() => {
  return "Page";
});
PageSchema.set("toObject", schemaOptions);
PageSchema.set("toJSON", schemaOptions);
export default mongoose.model("Page", PageSchema);
