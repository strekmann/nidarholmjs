import mongoose from "mongoose";
import uuid from "node-uuid";

import schemaOptions from "./schemaOptions";

const OrganizationEventGroupResponsibilitySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4,
  },
  name: { type: String, trim: true, required: true },
  last: { type: String, ref: "Group" },
  reminderDaysBefore: { type: Number },
  reminderAtHour: { type: Number },
  reminderText: { type: String },
  organization: { type: String, ref: "Organization", index: true },
});

OrganizationEventGroupResponsibilitySchema.set("toObject", schemaOptions);
OrganizationEventGroupResponsibilitySchema.set("toJSON", schemaOptions);
OrganizationEventGroupResponsibilitySchema.virtual("_type").get(() => {
  return "OrganizationEventGroupResponsibility";
});
export default mongoose.model(
  "OrganizationEventGroupResponsibility",
  OrganizationEventGroupResponsibilitySchema,
);
