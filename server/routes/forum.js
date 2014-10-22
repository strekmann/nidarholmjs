var _ = require('underscore'),
    express = require('express'),
    router = express.Router(),
    shortid = require('short-mongo-id'),
    moment = require('moment'),
    parse_web_permissions = require('../lib/util').parse_web_permissions,
    snippetify = require('../lib/util').snippetify,
    ForumPost = require('../models/forum').ForumPost,
    ForumReply = require('../models/forum').ForumReply,
    ForumComment = require('../models/forum').ForumComment,
    Activity = require('../models').Activity;

// forum with prefix /forum

router.get('/', function (req, res, next) {
    var query = ForumPost.find();
    if (req.user) {
        query = query.or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = query.where({'permissions.public': true});
    }
    query = query.sort('-created')
        .populate('creator', 'username name profile_picture_path')
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
                    posts: posts,
                    meta: {title: "Forum"}
                });
            }
        });
    });
});

router.get(/^\/t\/(.+)/, function (req, res, next) {
    // sende med prosjekt i url, eller søke opp prosjekter for alle tags?
    // sende med prosjekt i url
    var tags = req.params[0].replace(/\/$/, '').split("/"),
        tagquery = {'tags': { $all: tags }},
        query = ForumPost.find(tagquery);
    if (req.user) {
        query = query.or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = query.where({'permissions.public': true});
    }
    query = query.sort('-created')
        .populate('creator', 'username name profile_picture_path')
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
                    posts: posts,
                    meta: {title: "Forum"}
                });
            }
        });
    });
});

router.post('/', function (req, res, next) {
    if (!req.is_member) {
        res.status(403).json('Forbidden');
    }
    else {
        var post = new ForumPost();
        post._id = shortid();
        post.title = req.body.title;
        post.creator = req.user._id;
        post.mdtext = req.body.mdtext;
        post.tags = req.body.tags;
        post.permissions = parse_web_permissions(req.body.permissions);
        post.save(function (err) {
            if (err) {
                return next(err);
            }
            var activity = new Activity();
            activity.content_type = 'forum';
            activity.content_ids = [post._id];
            activity.title = post.title;
            activity.changes = [{user: post.creator, changed: post.created}];
            activity.permissions = post.permissions;
            activity.tags = post.tags;
            activity.modified = post.created;
            activity.content = {
                snippet: snippetify(post.mdtext)
            };

            activity.save(function (err) {});
            if (err) {
                return next(err);
            }
            post.populate('creator', 'username name profile_picture_path', function (err, post) {
                res.json(200, post);
            });
        });
    }
});

router.put('/:id', function (req, res, next) {
    var title = req.body.title,
        mdtext = req.body.mdtext,
        tags = req.body.tags,
        permissions = parse_web_permissions(req.body.permissions);

    ForumPost.findById(req.params.id, function (err, post) {
        if (post.creator === req.user._id || req.is_admin) {
            post.title = title;
            post.mdtext = mdtext;
            post.tags = tags;
            post.permissions = permissions;
            post.modified = moment();
            post.save(function (err) {
                if (err) {
                    console.error("ERR", err);
                    return next(err);
                }
                post.populate('creator', 'username name profile_picture_path', function (err, post) {
                    Activity.findOne({content_type: 'forum', content_ids: post._id}, function (err, activity) {
                        if (activity) {
                            activity.title = title;
                            activity.modified = post.modified;
                            activity.permissions = post.permissions;
                            activity.tags = post.tags;
                            activity.content = {
                                snippet: snippetify(post.mdtext)
                            };
                            activity.changes.push({user: req.user._id, changed: post.modified});
                            activity.save(function (err, activity) {
                                res.json(200, post);
                            });
                        }
                        else {
                            res.json(200, post);
                        }
                    });
                });
            });
        }
        else {
            res.json(403, 'Forbidden');
        }
    });
});

router.delete('/:id', function (req, res, next) {
    // TODO: Add permission checks
    var id = req.params.id;

    ForumPost.findByIdAndRemove(id, function (err, post) {
        if (err) { return next(err); }
        if (post.creator === req.user._id || req.is_admin) {
            Activity.findOneAndRemove({content_type: 'forum', content_ids: post._id}, function (err, activity) {});
            res.json(200, post);
        }
        else {
            res.json(403, 'Forbidden');
        }
    });
});

router.get('/:id', function (req, res, next) {
    ForumPost.findById(req.params.id)
    .or([
        {creator: req.user._id},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ])
    .populate('creator', 'username name profile_picture_path')
    .populate('replies.creator', 'username name profile_picture_path')
    .populate('replies.comments.creator', 'username name profile_picture_path').exec(function (err, post) {
        if (err) {
            return next(err);
        }

        if (!post) {
            res.send(404, 'Not found');
        }
        else {
            post.replies.reverse();

            res.format({
                json: function(){
                    res.json(200, post);
                },

                html: function(){
                    res.render('forum/thread', {
                        post: post,
                        meta: {title: post.title}
                    });
                }
            });
        }
    });
});

router.post('/:postid/replies', function (req, res, next) {
    var postid = req.params.postid;

    ForumPost.findById(postid)
    .or([
        {creator: req.user._id},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ])
    .exec(function (err, post) {
        if (err) {
            return next(err);
        }
        if (!post) {
            res.json(404, 'Not found');
        }
        else {
            var reply = new ForumReply();
            reply.mdtext = req.body.mdtext;
            reply.creator = req.user._id;

            post.replies.push(reply);
            post.save(function (err) {
                if (err) {
                    return next(err);
                }
                var modified = moment();
                Activity.update({content_type: 'forum', content_ids: post._id}, {
                    $push: {changes: {user: req.user._id, changed: modified}},
                    $set: {modified: modified}
                }, function () {});
                reply.populate('creator', 'username name profile_picture_path', function (err, reply) {
                    res.json(200, reply);
                });
            });
        }
    });
});

router.delete('/forum/:postid/replies/:replyid', function (req, res, next) {
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
});

router.put('/:postid/replies/:replyid', function (req, res, next) {
    var postid = req.params.postid,
        replyid = req.params.replyid,
        mdtext = req.body.mdtext;

    ForumPost.findById(postid, function (err, post) {
        if (err) {
            return next(err);
        }
        var reply = post.replies.id(replyid);
        if (reply === undefined) {
            return next(new Error('Reply not found, could not edit reply'));
        }
        if (reply.creator === req.user._id || req.is_admin) {
            reply.mdtext = mdtext;
            post.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.json(200, reply);
            });
        }
        else {
            res.json(403, 'Forbidden');
        }
    });
});

router.get('/:id/replies', function (req, res, next) {
    ForumPost.findById(req.params.id)
    .or([
        {creator: req.user._id},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ])
    .exec(function (err, post) {
        if (err) {
            return next(err);
        }
        res.json(200, post.replies);
    });
});

router.post('/:postid/replies/:replyid/comments',
            function (req, res, next) {
    var replyid = req.params.replyid;

    ForumPost.findOne({'replies._id': replyid}, function (err, post) {
        if (err) {
            return next(err);
        }
        if (post) {
            var comment = new ForumComment();
            comment.mdtext = req.body.mdtext;
            comment.creator = req.user._id;
            var reply = post.replies.id(replyid);
            if (reply === undefined) {
                return next(new Error('Reply not found, could not add comment'));
            }
            reply.comments.push(comment);
            post.save(function (err) {
                if (err) {
                    return next(err);
                }
                var modified = moment();
                Activity.update({content_type: 'forum', content_ids: post._id}, {
                    $push: {changes: {user: req.user._id, changed: modified}},
                    $set: {modified: modified}
                }, function () {});
                comment.populate('creator', 'username name profile_picture_path', function (err, comment) {
                    if (err) {
                        return next(err);
                    }
                    res.json(200, comment);
                });
            });
        } else {
            return next(new Error('Post not found, could not add comment'));
        }
    });
});

router.put('/:postid/replies/:replyid/comments/:commentid',
           function (req, res, next) {
    var postid = req.params.postid,
        replyid = req.params.replyid,
        commentid = req.params.commentid,
        mdtext = req.body.mdtext;

    ForumPost.findById(postid, function (err, post) {
        if (err) {
            return next(err);
        }
        var reply = post.replies.id(replyid);
        if (reply === undefined) {
            return next(new Error('Reply not found, could not edit comment'));
        }
        var comment = reply.comments.id(commentid);
        if (reply === undefined) {
            return next(new Error('Comment not found, could not edit comment'));
        }
        if (comment.creator === req.user._id || req.is_admin) {
            comment.mdtext = mdtext;
            post.save(function (err) {
                if (err) {
                    return next(err);
                }
                res.json(200, comment);
            });
        }
        else {
            res.json(403, 'Forbidden');
        }
    });
});

router.delete('/:postid/replies/:replyid/comments/:commentid',
              function (req, res, next) {
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
});

module.exports = router;
