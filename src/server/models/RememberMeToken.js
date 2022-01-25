import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RememberMeTokenSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
    default: uuidv4,
  },
  user: { type: String, required: true },
  created: { type: Date, required: true, default: Date.now },
});

export default mongoose.model("RememberMeToken", RememberMeTokenSchema);
