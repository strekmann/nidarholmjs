import mongoose from "mongoose";
import { v4 } from "uuid";

export interface IPasswordCode extends mongoose.Document {
  _id: string;
  user: string;
  created: Date;
}

const PasswordCodeSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: v4,
  },
  user: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
});

export default mongoose.model <
  IPasswordCode >
  ("PasswordCode", PasswordCodeSchema);
