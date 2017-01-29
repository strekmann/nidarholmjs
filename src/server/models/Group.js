import mongoose from 'mongoose';
import schemaOptions from './schemaOptions';

const GroupSchema = new mongoose.Schema({
    _id: { type: String, unique: true, required: true },
    name: { type: String, trim: true, required: true },
    organization: { type: String, ref: 'Organization' },
    members: [{
        user: { type: String, ref: 'User' },
        role: {
            title: { type: String, trim: true },
            email: { type: String, trim: true },
        },
    }],
    group_email: { type: String, lowercase: true, trim: true },
    group_leader_email: { type: String, lowercase: true, trim: true },
    externally_hidden: { type: Boolean, default: false },
    old_id: { type: Number },
});

GroupSchema.set('toJSON', schemaOptions);
GroupSchema.set('toObject', schemaOptions);
GroupSchema.virtual('_type').get(() => 'Group');
export default mongoose.model('Group', GroupSchema);
