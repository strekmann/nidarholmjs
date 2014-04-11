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
  client.query('SELECT * from forum_debate order by id', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    async.eachSeries(result.rows, function (post, callback) {
        //log.debug(post);
        if (post.parent_id) {
            ForumPost.findOne({original_id: post.parent_id}, function (err, parent) {
                if (parent) {
                    // this is a ForumReply, check if it is already added:
                    ForumPost.findOne({'replies.original_id': post.id}, function (err, forumpost) {
                        if (err) { callback(err); }
                        var reply = {
                            created: post.created,
                            creator: 'nidarholm.' + post.user_id,
                            mdtext: post.content,
                            original_id: post.id,
                            original_title: post.title,
                            original_slug: post.slug
                        };

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
                                });
                                callback(err);
                            });
                        }
                    });
                } else {
                    ForumPost.findOne({'replies.original_id': post.parent_id}, function (err, parent) {
                        var new_comment = new ForumComment();
                        new_comment.created = post.created;
                        new_comment.creator = 'nidarholm.' + post.user_id;
                        new_comment.mdtext = post.content;
                        new_comment.original_id = post.id;
                        new_comment.original_title = post.title;
                        new_comment.original_slug = post.slug;

                        if (parent) {
                            var reply_index;
                            var reply = _.find(parent.replies, function (reply, i) {
                                //log.debug(reply.original_id, post.parent_id, reply.original_id === post.parent_id);
                                if (reply.original_id === post.parent_id) {
                                    reply_index = i;
                                    return true;
                                }
                            });
                            //log.debug("r", reply);

                            // check if comment already exists:
                            var comment_index;
                            var comment = _.find(reply.comments, function (comment, i) {
                                if (comment.original_id === post.id) {
                                    comment_index = i;
                                    return true;
                                }
                            });

                            //log.debug(comment);
                            if (comment) {
                                log.debug("update", post.id);
                                parent.replies[reply_index].comments[comment_index] = new_comment;
                            } else {
                                log.debug("add", post.id);
                                parent.replies[reply_index].comments.push(new_comment);
                                Activity.findOneAndUpdate({content_type: 'forum', content_id: parent._id}, {$push: {users: new_comment.creator}, $set: {modified: new_comment.created}}, function (err, activity) {
                                    if (err) {
                                        log.warn(err, post, parent, new_comment);
                                    }
                                });
                            }
                            parent.save(function (err) {
                                //log.debug(parent);
                                callback(err);
                            });
                        } else {
                            //log.debug("her");
                            ForumPost.findOne({'replies.comments.original_id': post.parent_id}, {replies:{$elemMatch: {'comments.original_id': post.parent_id}}}, function (err, parent) {
                                if (parent) {
                                    var reply_index;
                                    var reply = parent.replies[0];
                                    //console.error(parent.replies.length);
                                    //log.debug("r", reply);

                                    // check if comment already exists:
                                    var comment_index;
                                    var comment = _.find(reply.comments, function (comment, i) {
                                        if (comment.original_id === post.id) {
                                            comment_index = i;
                                            return true;
                                        }
                                    });

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
                                            });
                                            callback(err);
                                        });
                                    }
                                } else {
                                    log.debug("not found: ", post);
                                    callback(err);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            var new_post = {
                title: post.title,
                created: post.created,
                modified: post.updated,
                creator: 'nidarholm.' + post.user_id,
                original_slug: post.slug,
                mdtext: post.content
            };
            if (!post.group_id) {
                _.extend(new_post, {permissions: {public: true, groups: [], users: []}});
                ForumPost.findOneAndUpdate({original_id: post.id}, new_post, {upsert: true}, function (err, newpost) {
                    log.debug("toppinnlegg: ", post.id);

                    var activity = new Activity();
                    activity.content_type = 'forum';
                    activity.content_id = newpost._id;
                    activity.title = newpost.title;
                    activity.users.push(newpost.creator);
                    activity.permissions = newpost.permissions;
                    activity.modified = newpost.created;
                    activity.save(function (err) {
                        if (err) {
                            log.warn(err, post);
                        }
                    });

                    callback(err);
                });
            } else {
                Group.findOne({old_id: post.group_id}, function (err, group) {
                    _.extend(new_post, {permissions: {public: false, groups: [group.id], users: []}});
                    ForumPost.findOneAndUpdate({original_id: post.id}, new_post, {upsert: true}, function (err, newpost) {
                        log.debug("toppinnlegg: ", post.id);

                        var activity = new Activity();
                        activity.content_type = 'forum';
                        activity.content_id = newpost._id;
                        activity.title = newpost.title;
                        activity.users.push(newpost.creator);
                        activity.permissions = newpost.permissions;
                        activity.modified = newpost.created;
                        activity.save(function (err) {
                            if (err) {
                                log.warn(err, post);
                            }
                        });

                        callback(err);
                    });
                });
            }
        }
    }, function (err) {
        if (err) {
            console.error(err);
        } else {
            log.debug("Done");
        }
        client.end();
        mongoose.connection.close();
    });
  });
});
