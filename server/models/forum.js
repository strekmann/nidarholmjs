var mongoose = require('mongoose');

var ForumCommentSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    mdtext: {type: String, trim: true},
    removed_by: {type: String, ref: 'User'},
    original_id: {type: Number},
    parent_id: {type: Number}
});

var ForumReplySchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    mdtext: {type: String, trim: true},
    removed_by: {type: String, ref: 'User'},
    comments: [ForumCommentSchema],
    original_id: {type: Number}
});

var ForumPostSchema = new mongoose.Schema({
    _id: {type: String, required: true, unique: true},
    title: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    modified: {type: Date},
    tags: [{type: String, lowercase: true, trim: true}],
    mdtext: {type: String, trim: true},
    removed_by: {type: String, ref: 'User'},
    permissions: {
        groups: [{type: String, ref: 'Group'}],
        users: [{type: String, ref: 'User'}],
        public: {type: Boolean, default: false}
    },
    replies: [ForumReplySchema],
    original_id: {type: Number},
    original_slug: {type: String}
});

module.exports = {
    ForumPost: mongoose.model('ForumPost', ForumPostSchema),
    ForumReply: mongoose.model('ForumReply', ForumReplySchema),
    ForumComment: mongoose.model('ForumComment', ForumCommentSchema)
};
