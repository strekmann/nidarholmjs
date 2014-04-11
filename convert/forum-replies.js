var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    winston = require('winston'),
    config = require('../server/settings'),
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    ForumPost = require('../server/models/forum').ForumPost,
    ForumComment = require('../server/models/forum').ForumComment,
    Activity = require('../server/models').Activity;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm");

var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: process.env.DEBUG ? 'debug' : 'info'})
    ]
});
client.connect(function(err) {
        if(err) {
        return console.error('could not connect to postgres', err);
    }

    client.query('SELECT * from s7n_threaded_comment order by id', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }

        async.eachSeries(result.rows, function (post, callback) {
            //log.debug(post);
            var key = parseInt(post.object_pk, 10);
            if (post.content_type_id === 24) {
                key = key + 10000;
            }
            ForumPost.findOne({'original_id': key}, function (err, parent) {
                if (err) {
                    callback(err);
                }
                else if (!parent) {
                    log.warn("No parent found for " + post.content_type_id + " " + post.object_pk);
                    callback();
                }
                else {
                    //log.debug("parent: "+ parent);
                    log.debug(key);
                    if (!post.parent_id) {
                        log.debug("no parent_id: this is a reply");
                        var reply = {
                            created: post.submit_date,
                            creator: 'nidarholm.' + post.user_id,
                            mdtext: post.content,
                            original_id: post.id,
                        };
                        if (post.is_removed) {
                            reply.removed_by = 'nidarholm.1';
                        }

                        // check if parent has this reply
                        ForumPost.findOne({'replies.original_id': post.id}, function (err, forumpost) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                if (forumpost) {
                                    ForumPost.update({'replies.original_id': post.id}, {$set: {'replies.$': reply}}, function (err, updated) {
                                        log.debug("updated reply", post.id);
                                        callback(err);
                                    });
                                } else {
                                    parent.replies.push(reply);
                                    parent.save(function (err) {
                                        log.debug("added new reply ", post.id);
                                        Activity.findOneAndUpdate({content_type: 'forum', content_id: parent._id}, {$push: {users: reply.creator}, $set: {modified: reply.created}}, function (err, activity) {
                                            if (err) {
                                                log.warn(err, post, parent, reply);
                                            }
                                            callback(err);
                                        });
                                    });
                                }
                            }
                        });
                    } else {
                        // this has a parent: it is a comment
                        log.debug("is comment");
                        var new_comment = new ForumComment();
                        new_comment.created = post.submit_date;
                        new_comment.creator = 'nidarholm.' + post.user_id;
                        new_comment.mdtext = post.content;
                        new_comment.original_id = post.id;
                        new_comment.parent_id = post.parent_id;
                        if (post.is_removed) {
                            new_comment.removed_by = 'nidarholm.1';
                        }

                        ForumPost.findOne({'replies.original_id': post.parent_id}, {replies:{$elemMatch: {'original_id': post.parent_id}}}, function (err, has_reply) {

                            if (has_reply) {
                                //console.log("has reply"+post.id);
                                var reply = has_reply.replies[0];

                                // check if comment already exists:
                                var comment_index;
                                var comment = _.find(reply.comments, function (comment, i) {
                                    if (comment.original_id === post.id) {
                                        comment_index = i;
                                        return true;
                                    }
                                });
                                /*
                                console.log(has_reply);
                                console.log(comment);
                                console.log(reply.comments);
                                */

                                if (comment) {
                                    ForumPost.update({'replies.comments.original_id': post.id}, {$set: {'replies.$.comments.$': new_comment}}, function (err, updated) {
                                        log.debug("update toplevel", post.id);
                                        callback(err);
                                    });
                                    //parent.replies[0].comments[comment_index] = new_comment;
                                } else {
                                    ForumPost.update({'replies.original_id': post.parent_id}, {$push: {'replies.$.comments': new_comment}}, function (err, updated) {
                                        log.debug("add toplevel", post.id);
                                        Activity.findOneAndUpdate({content_type: 'forum', content_id: parent._id}, {$push: {users: new_comment.creator}, $set: {modified: new_comment.created}}, function (err, activity) {
                                            if (err) {
                                                log.warn(err, post, parent, new_comment);
                                            }
                                            callback(err);
                                        });
                                    });
                                }
                            } else {
                                log.debug('not directly hanging on reply');
                                // not directly under reply, use parent_id to find reply
                                ForumPost.findOne({'replies.comments.original_id': post.parent_id}, {replies:{$elemMatch: {'comments.original_id': post.parent_id}}}, function (err, has_comment) {
                                    if (has_comment) {
                                        var reply = has_comment.replies[0];

                                        // check if comment already exists:
                                        var comment_index;
                                        var comment = _.find(reply.comments, function (comment, i) {
                                            if (comment.original_id === post.id) {
                                                comment_index = i;
                                                return true;
                                            }
                                        });
                                        /*console.log(has_comment);
                                        console.log(comment);
                                        console.log(reply.comments);
                                        */

                                        if (comment) {
                                            ForumPost.update({'replies.comments.original_id': post.parent_id}, {$set: {'replies.$.comments.$': new_comment}}, function (err, updated) {
                                                log.debug("update inner", post.id);
                                                callback(err);
                                            });
                                            //parent.replies[0].comments[comment_index] = new_comment;
                                        } else {
                                            ForumPost.update({'replies.comments.original_id': post.parent_id}, {$push: {'replies.$.comments': new_comment}}, function (err, updated) {
                                                log.debug("add inner", post.id);
                                                Activity.findOneAndUpdate({content_type: 'forum', content_id: parent._id}, {$push: {users: new_comment.creator}, $set: {modified: new_comment.created}}, function (err, activity) {
                                                    if (err) {
                                                        log.warn(err, post, parent, new_comment);
                                                    }
                                                    callback(err);
                                                });
                                            });
                                        }
                                    }
                                    else {
                                        log.debug("not found", post);
                                        callback("NOT FOUND");
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }, function (err) {
            if (err) {
                console.error(err);
            }
            client.end();
            mongoose.connection.close();
        });
    });
});
