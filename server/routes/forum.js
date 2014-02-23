var _ = require('underscore'),
    ForumPost = require('../models/forum').ForumPost,
    ForumReply = require('../models/forum').ForumReply,
    ForumComment = require('../models/forum').ForumComment;

var matchObjectId = /^[0-9a-fA-F]{24}$/;
var isObjectId = function(string){
    return matchObjectId.test(string);
};

module.exports.all = function (req, res, next) {
    ForumPost.find({}).exec(function (err, posts) {
        if (err) {
            return next(err);
        }
        res.json(200, {
            posts: posts
        });
    });
};

module.exports.create_post = function (req, res, next) {
    var post = new ForumPost();
    post.title = req.body.title;
    post.creator = 'user1';//req.user;
    post.mdtext = req.body.mdtext;
    post.save(function (err) {
        if (err) {
            return next(err);
        }
        res.json(200, post);
    });
};

module.exports.get_post = function (req, res, next) {
    // if given id is not a valid ObjectID, return 404.
    if (!isObjectId(req.params.id)){
        return next();
    }

    ForumPost.findById(req.params.id, function (err, post) {
        if (err) {
            return next(err);
        }

        post.replies.reverse();

        res.format({
            json: function(){
                res.json(200, post);
            },

            html: function(){
                res.render('forum/thread', {
                    post: post
                });
            }
        });
    });
};

module.exports.create_reply = function (req, res, next) {
    ForumPost.findById(req.params.id, function (err, post) {
        if (err) {
            return next(err);
        }
        var reply = new ForumReply();
        reply.mdtext = req.body.mdtext;
        reply.creator = 'user2'; //FIXME

        post.replies.push(reply);
        post.save(function (err) {
            if (err) {
            return next(err);
            }
            res.json(200, reply);
        });
    });
};

module.exports.get_replies = function (req, res, next) {
    ForumPost.findById(req.params.id, function (err, post) {
        if (err) {
            return next(err);
        }
        res.json(200, post.replies);
    });
};

module.exports.create_comment = function (req, res, next) {
    ForumPost.findOne({'replies._id': req.params.rid}, function (err, post) {
        if (err) {
            return next(err);
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
                            return next(err);
                        }
                        res.json(200, comment);
                    });
                }
            });
        }
    });
};