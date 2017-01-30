import mongoose from 'mongoose';
import uuid from 'node-uuid';

const PasswordCodeSchema = new mongoose.Schema({
    _id: { type: String, unique: true, required: true, default: uuid.v4 },
    user: { type: String, required: true },
    created: { type: Date, required: true, default: Date.now },
});

export default mongoose.model('PasswordCode', PasswordCodeSchema);
