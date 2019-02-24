// @flow

import mongoose from "mongoose";

import schemaOptions from "./schemaOptions";

const OrganizationEventPersonResponsibility = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  organization: { type: String, ref: "Organization", index: true },
});

OrganizationEventPersonResponsibility.set("toObject", schemaOptions);
OrganizationEventPersonResponsibility.set("toJSON", schemaOptions);
OrganizationEventPersonResponsibility.virtual("_type").get(() => {
  return "OrganizationEventPersonResponsibility";
});
export default mongoose.model(
  "OrganizationEventPersonResponsibility",
  OrganizationEventPersonResponsibility,
);
