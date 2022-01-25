import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import schemaOptions from "./schemaOptions";

export interface IOrganizationEventGroupResponsibility
  extends mongoose.Document {
  _id: string;
  name: string;
  last?: string;
  reminderDaysBefore?: number;
  reminderAtHour?: number;
  reminderText: string;
  organization: string;
}

const OrganizationEventGroupResponsibilitySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuidv4,
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
export default mongoose.model<IOrganizationEventGroupResponsibility>(
  "OrganizationEventGroupResponsibility",
  OrganizationEventGroupResponsibilitySchema,
);
