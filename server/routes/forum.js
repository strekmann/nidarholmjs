var _ = require('underscore'),
    ForumPost = require('../models/forum').ForumPost,
    ForumReply = require('../models/forum').ForumReply,
    ForumComment = require('../models/forum').ForumComment;

module.exports.all = function (req, res) {
    ForumPost.find({}).exec(function (err, posts) {
        if (err) {
            throw err;
        }
        res.json(200, {
            posts: posts
        });
    });
};

module.exports.create_post = function (req, res) {
    var post = new ForumPost();
    post.title = req.body.title;
    post.creator = 'user1';//req.user;
    post.mdtext = req.body.mdtext;
    post.save(function (err) {
        if (err) {
            throw err;
        }
        res.json(200, post);
    });
};

module.exports.get_post = function (req, res) {
    ForumPost.findById(req.params.id, function (err, post) {
        if (err) {
            throw err;
        }
        res.json(200, post);
    });
};

module.exports.create_reply = function (req, res) {
    ForumPost.findById(req.params.id, function (err, post) {
        if (err) {
            throw err;
        }
        var reply = new ForumReply();
        reply.mdtext = req.body.mdtext;
        reply.creator = 'user2'; //FIXME

        post.replies.push(reply);
        post.save(function (err) {
            if (err) {
                throw err;
            }
            res.json(200, reply);
        });
    });
};

module.exports.get_replies = function (req, res) {
    ForumPost.findById(req.params.id, function (err, post) {
        if (err) {
            throw err;
        }
        res.json(200, post.replies);
    });
};

module.exports.create_comment = function (req, res) {
    ForumPost.findOne({'replies._id': req.params.rid}, function (err, post) {
        if (err) {
            throw err;
        }
        if (post) {
            var comment = new ForumComment();
            comment.mdtext = req.body.mdtext;
            comment.creator = 'user1'; //FIXME
            _.find(post.replies, function (reply){
                if (reply._id.toString() === req.params.rid) {
                    reply.comments.push(comment);
                    post.save(function (err) {
                        if (err) {
                            throw err;
                        }
                        res.json(200, comment);
                    });
                }
            });
        }
    });
};
