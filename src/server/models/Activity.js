import mongoose from 'mongoose';
import schemaOptions from './schemaOptions';

const ActivitySchema = new mongoose.Schema({
    content_type: { type: String, required: true },
    content_ids: [{ type: String }],
    title: { type: String, required: true },
    project: { type: String, ref: 'Project' },
    tags: [{ type: String }],
    content: {}, // mixed
    changes: [{
        changed: { type: Date },
        user: { type: String, ref: 'User' },
    }],
    permissions: {
        groups: [{ type: String, ref: 'Group' }],
        users: [{ type: String, ref: 'User' }],
        public: { type: Boolean, default: false },
    },
    modified: { type: Date, default: Date.now },
});

ActivitySchema.virtual('_type').get(() => {
    return 'Activity';
});
ActivitySchema.set('toObject', schemaOptions);
ActivitySchema.set('toJSON', schemaOptions);
export default mongoose.model('Activity', ActivitySchema);
