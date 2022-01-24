import mongoose from "mongoose";
import uuid from "uuid";
import { IFile } from "./File";
import schemaOptions from "./schemaOptions";
import { IUser } from "./User";

export interface IPiece extends mongoose.Document {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  description_composer: string;
  description_arranger: string;
  description_publisher: string;
  composers: string[];
  arrangers: string[];
  scores: IFile[];
  unique_number: number;
  record_number: number;
  archive_number: number;
  band_setup: number;
  short_genre: string;
  genre: string;
  published: string;
  acquired: string;
  concerts: string;
  maintenance_status: string;
  nationality: string;
  difficulty: number;
  publisher: string;
  import_id: string;
  created: Date;
  creator: IUser;
}

const PieceSchema = new mongoose.Schema({
  _id: { type: String, required: true, default: uuid.v4 },
  title: { type: String, trim: true, required: true },
  subtitle: { type: String, trim: true },
  description: { type: String, trim: true },
  description_composer: { type: String, trim: true },
  description_arranger: { type: String, trim: true },
  description_publisher: { type: String, trim: true },
  // part: {type: String, trim: true},
  composers: [{ type: String, trim: true }],
  arrangers: [{ type: String, trim: true }],
  scores: [{ type: String, ref: "File" }],
  unique_number: { type: Number },
  record_number: { type: Number },
  archive_number: { type: Number },
  band_setup: { type: String },
  short_genre: { type: String },
  genre: { type: String },
  published: { type: String },
  acquired: { type: String },
  concerts: { type: String },
  maintenance_status: { type: String },
  nationality: { type: String },
  difficulty: { type: Number },
  publisher: { type: String },
  import_id: { type: Number },
  created: { type: Date, default: Date.now },
  creator: { type: String, ref: "User", required: true },
});

PieceSchema.virtual("_type").get(() => {
  return "Piece";
});
PieceSchema.set("toObject", schemaOptions);
PieceSchema.set("toJSON", schemaOptions);
export default mongoose.model<IPiece>("Piece", PieceSchema);
