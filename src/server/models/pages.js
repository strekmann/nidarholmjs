var mongoose = require('mongoose');

var PageSchema = new mongoose.Schema({
    _id: { type: String, required: true, unique: true }, // id
    slug: { type: String, required: true, unique: true },
    mdtext: { type: String, trim: true },
    summary: { type: String, trim: true, default: '' },
    permissions: {
        groups: [{ type: String, ref: 'Group' }],
        users: [{ type: String, ref: 'User' }],
        public: { type: Boolean, default: true }, // temporary FIXME
    },
    created: { type: Date, default: Date.now },
    updated: { type: Date },
    updator: { type: String, ref: 'User' }
});

module.exports = {
    Page: mongoose.model('Page', PageSchema)
};
