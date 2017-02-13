import mongoose from 'mongoose';
import uuid from 'node-uuid';
import schemaOptions from './schemaOptions';

const PieceSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true, default: uuid.v4 },
    title: { type: String, trim: true, required: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },
    description_composer: { type: String, trim: true },
    description_arranger: { type: String, trim: true },
    description_publisher: { type: String, trim: true },
    // part: {type: String, trim: true},
    composers: [{ type: String, trim: true }],
    arrangers: [{ type: String, trim: true }],
    scores: [{ type: String, ref: 'File' }],
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
    creator: { type: String, ref: 'User', required: true },
});

PieceSchema.virtual('_type').get(() => 'Piece');
PieceSchema.set('toObject', schemaOptions);
PieceSchema.set('toJSON', schemaOptions);
export default mongoose.model('Piece', PieceSchema);
