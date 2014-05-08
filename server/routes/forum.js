var _ = require('underscore'),
    shortid = require('short-mongo-id'),
    parse_web_permissions = require('../lib/util').parse_web_permissions,
    ForumPost = require('../models/forum').ForumPost,
    ForumReply = require('../models/forum').ForumReply,
    ForumComment = require('../models/forum').ForumComment,
    Activity = require('../models').Activity;

module.exports.index = function (req, res, next) {
    // sende med prosjekt i url, eller søke opp prosjekter for alle tags?
    // sende med prosjekt i url
    var tagquery,
        tags;

    if (req.params[0]) {
        tags = req.params[0].replace(/\/$/, '').split("/");
        tagquery = {'tags': { $all: tags }};
    } else {
        tagquery = {};
    }
    var query = ForumPost.find(tagquery)
    .sort('-created')
    .populate('creator', 'username name')
    .select('_id title created mdtext tags permissions creator');

    if (req.query.page) {
        query = query.skip(20 * req.query.page);
    }
    query = query.limit(20);
    query.exec(function (err, posts) {
        if (err) {
            return next(err);
        }

        res.format({
            json: function () {
                res.json(200, posts);
            },
            html: function () {
                res.render('forum/index', {
                    posts: posts
                });
            }
        });
    });
};

module.exports.create_post = function (req, res, next) {
    var post = new ForumPost();
    post._id = shortid();
    post.title = req.body.title;
    post.creator = req.user;
    post.mdtext = req.body.mdtext;
    post.permissions = parse_web_permissions(req.body.permissions);
    post.save(function (err) {
        if (err) {
            return next(err);
        }
        var activity = new Activity();
        activity.content_type = 'forum';
        activity.content_id = post._id;
        activity.title = post.title;
        activity.users.push(req.user);
        activity.permissions = post.permissions;
        activity.save(function (err) {});
        if (err) {
            return next(err);
        }
        post.populate('creator', function (err, post) {
            res.json(200, post);
        });
    });
};

module.exports.delete_post = function (req, res, next) {
    var id = req.params.id;

    ForumPost.findByIdAndRemove(id, function (err, post) {
        if (err) { return next(err); }
        Activity.findOneAndRemove({content_type: 'forum', content_id: post._id}, function (err, activity) {});
        res.json(200, post);
    });
};

module.exports.get_post = function (req, res, next) {

    ForumPost.findById(req.params.id).populate('creator').populate('replies.creator', 'username name profile_picture_path').populate('replies.comments.creator', 'username name profile_picture_path').exec(function (err, post) {
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
    var postid = req.params.postid;

    ForumPost.findById(postid, function (err, post) {
        if (err) {
            return next(err);
        }
        var reply = new ForumReply();
        reply.mdtext = req.body.mdtext;
        reply.creator = req.user;

        post.replies.push(reply);
        post.save(function (err) {
            if (err) {
                return next(err);
            }
            Activity.findOneAndUpdate({content_type: 'forum', content_id: post._id}, {$push: {users: req.user}, $set: {modified: new Date()}}, function (err, activity) {});
            reply.populate('creator', 'username name profile_picture_path', function (err, reply) {
                res.json(200, reply);
            });
        });
    });
};

module.exports.delete_reply = function (req, res, next) {
    var postid = req.params.postid,
        replyid = req.params.replyid;

    ForumPost.findById(postid, function (err, post) {
        if (err) {
            return next(err);
        }
        post.replies.pull(replyid);
        post.save(function (err) {
            if (err) {
                return next(err);
            }
            // TODO: Better to leave name here than to remove all.
            // Activity.findOneAndUpdate({content_type: 'forum', content_id: post._id}, {$pull: {users: req.user}, $set: {modified: new Date()}}, function (err, activity) {});
            res.json(200);
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
    var replyid = req.params.replyid;

    ForumPost.findOne({'replies._id': replyid}, function (err, post) {
        if (err) {
            return next(err);
        }
        if (post) {
            var comment = new ForumComment();
            comment.mdtext = req.body.mdtext;
            comment.creator = req.user;
            var reply = post.replies.id(replyid);
            if (reply === undefined) {
                return next(new Error('Reply not found, could not add comment'));
            }
            reply.comments.push(comment);
            post.save(function (err) {
                if (err) {
                    return next(err);
                }
                Activity.findOneAndUpdate({content_type: 'forum', content_id: post._id}, {$push: {users: req.user}, $set: {modified: new Date()}}, function (err, activity) {});
                comment.populate('creator', 'username name profile_picture_path', function (err, comment) {
                    res.json(200, comment);
                });
            });
        } else {
            return next(new Error('Post not found, could not add comment'));
        }
    });
};

module.exports.delete_comment = function (req, res, next) {
    var postid = req.params.postid,
        replyid = req.params.replyid,
        commentid = req.params.commentid;

    ForumPost.findById(postid, function (err, post) {
        if (err) {
            return next(err);
        }
        if (post) {
            var reply = post.replies.id(replyid);
            if (reply === undefined) {
                return next(new Error('Reply not found, could not add comment'));
            }
            reply.comments.pull(commentid);
            post.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.json(200);
            });
        } else {
            return next(new Error('Post not found, could not delete comment'));
        }
    });
};
