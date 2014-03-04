var mongoose = require('mongoose'),
    User = require('../models').User,
    UserSchema = require('../models').schema.user,
    GroupSchema = require('../models').schema.group;

var ForumCommentSchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    mdtext: {type: String, trim: true}
});

var ForumReplySchema = new mongoose.Schema({
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    mdtext: {type: String, trim: true},
    comments: [ForumCommentSchema]
});

var ForumPostSchema = new mongoose.Schema({
    title: {type: String, trim: true, required: true},
    created: {type: Date, default: Date.now},
    creator: {type: String, ref: 'User'},
    modified: {type: Date},
    tags: [{type: String, lowercase: true, trim: true}],
    mdtext: {type: String, trim: true},
    permissions: {
        groups: {type: [GroupSchema], sparse: true},
        users: {type: [UserSchema], sparse: true},
        broadcast: {type: Boolean, default: false}
    },
    replies: [ForumReplySchema]
});

module.exports = {
    ForumPost: mongoose.model('ForumPost', ForumPostSchema),
    ForumReply: mongoose.model('ForumReply', ForumReplySchema),
    ForumComment: mongoose.model('ForumComment', ForumCommentSchema)
};
