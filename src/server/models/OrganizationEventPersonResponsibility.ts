import mongoose from "mongoose";
import uuid from "node-uuid";

import schemaOptions from "./schemaOptions";

const OrganizationEventPersonResponsibilitySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuid.v4,
  },
  name: { type: String, trim: true, required: true },
  last: { type: String, ref: "User" },
  reminderDaysBefore: { type: Number },
  reminderAtHour: { type: Number },
  reminderText: { type: String },
  organization: { type: String, ref: "Organization", index: true },
});

OrganizationEventPersonResponsibilitySchema.set("toObject", schemaOptions);
OrganizationEventPersonResponsibilitySchema.set("toJSON", schemaOptions);
OrganizationEventPersonResponsibilitySchema.virtual("_type").get(() => {
  return "OrganizationEventPersonResponsibility";
});
export default mongoose.model(
  "OrganizationEventPersonResponsibility",
  OrganizationEventPersonResponsibilitySchema,
);
