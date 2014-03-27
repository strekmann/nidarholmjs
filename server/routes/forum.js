var _ = require('underscore'),
    util = require('../lib/util'),
    ForumPost = require('../models/forum').ForumPost,
    ForumReply = require('../models/forum').ForumReply,
    ForumComment = require('../models/forum').ForumComment;

var matchObjectId = /^[0-9a-fA-F]{24}$/;
var isObjectId = function(string){
    return matchObjectId.test(string);
};

module.exports.index = function (req, res, next) {
    // sende med prosjekt i url, eller søke opp prosjekter for alle tags?
    // sende med prosjekt i url
    var tagquery,
        tags;

    if (req.params[0]) {
        tags = req.params[0].split("/");
        tagquery = {'tags': { $all: tags }};
    } else {
        tagquery = {};
    }
    var query = ForumPost.find(tagquery)
    .sort('-created')
    .populate('creator', 'username name')
    .select('_id title created mdtext tags permissions creator');

    if (req.query.page) {
        query = query.skip(2 * req.query.page);
    }
    query = query.limit(2);
    query.exec(function (err, posts) {
        if (err) {
            return next(err);
        }

        // TODO: have nicer ids on posts?
        posts = _.map(posts, function(post){
            var p = post.toJSON();
            p.oid = util.h2b64(post.id);
            return p;
        });

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
    post.title = req.body.title;
    post.creator = req.user;
    post.mdtext = req.body.mdtext;
    post.permissions = util.parse_web_permissions(req.body.permissions);
    post.save(function (err) {
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
        res.json(200, post);
    });
};

module.exports.get_post = function (req, res, next) {
    req.params.id = util.b642h(req.params.id);

    // if given id is not a valid ObjectID, return 404.
    if (!isObjectId(req.params.id)){
        return next();
    }

    ForumPost.findById(req.params.id).populate('creator').exec(function (err, post) {
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
            res.json(200, reply);
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
                res.json(200, comment);
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
