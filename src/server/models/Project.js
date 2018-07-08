import mongoose from "mongoose";

import schemaOptions from "./schemaOptions";

const ProjectSchema = new mongoose.Schema({
  // _id: {type: String, lowercase: true, required: true, unique: true, trim: true},
  tag: { type: String, trim: true, required: true },
  title: { type: String, required: true },
  public_mdtext: { type: String },
  private_mdtext: { type: String },
  start: { type: Date },
  end: { type: Date, required: true },
  year: { type: Number, required: true, index: true }, // end.year
  creator: { type: String, ref: "User", required: true },
  created: { type: Date, default: Date.now },
  music: [
    {
      piece: { type: String, ref: "Piece" },
      parts: { type: String, trim: true }, // parts played
      // not in use
      contributors: [
        {
          // add a field for userid later?
          name: { type: String },
          role: { type: String },
        },
      ],
    },
  ],
  permissions: {
    groups: [{ type: String, ref: "Group" }],
    users: [{ type: String, ref: "User" }],
    public: { type: Boolean, default: false },
  },
  contributors: [
    {
      user: { type: String, ref: "User" },
      role: { type: String },
    },
  ],
  poster: { type: String, ref: "File" },
  original_project_users: [{ type: String, ref: "User" }],
  conductors: [{ type: String, ref: "User" }],
  managers: [{ type: String, ref: "User" }],
});

ProjectSchema.virtual("_type").get(() => {
  return "Project";
});
ProjectSchema.set("toObject", schemaOptions);
ProjectSchema.set("toJSON", schemaOptions);
export default mongoose.model("Project", ProjectSchema);
