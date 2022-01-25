import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import schemaOptions from "./schemaOptions";

export interface IOrganizationEventPersonResponsibility
  extends mongoose.Document {
  _id: string;
  name: string;
  last?: string;
  reminderDaysBefore?: number;
  reminderAtHour?: number;
  reminderText: string;
  organization: string;
}

const OrganizationEventPersonResponsibilitySchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuidv4,
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
export default mongoose.model<IOrganizationEventPersonResponsibility>(
  "OrganizationEventPersonResponsibility",
  OrganizationEventPersonResponsibilitySchema,
);
