import mongoose from 'mongoose';
import schemaOptions from './schemaOptions';

const EventSchema = new mongoose.Schema({
    title: { type: String, trim: true, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    // whole_day needed? from nidarholm
    original_whole_day: { type: Boolean, default: false },
    original_event_serie: { type: Number },
    original_event_category: { type: Number },
    location: { type: String },
    permissions: {
        groups: [{ type: String, ref: 'Group' }],
        users: [{ type: String, ref: 'User' }],
        public: { type: Boolean, default: false },
    },
    tags: [{ type: String }],
    creator: { type: String, ref: 'User', required: true },
    created: { type: Date, default: Date.now },
    modified: { type: Date },
    music: [{
        title: { type: String, required: true },
        part: { type: String },
        composer: { type: String },
        arrangers: [{ type: String }],
        contributors: [{
            name: { type: String },
            role: { type: String },
        }],
    }],
    contributors: [{
        name: { type: String },
        role: { type: String },
    }],
    mdtext: { type: String },
});

EventSchema.virtual('_type').get(() => 'Event');
EventSchema.set('toObject', schemaOptions);
EventSchema.set('toJSON', schemaOptions);
export default mongoose.model('Event', EventSchema);