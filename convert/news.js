var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    config = require('../server/settings'),
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    ForumPost = require('../server/models/forum').ForumPost,
    ForumComment = require('../server/models/forum').ForumComment;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm");
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * from news_story order by id', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    async.eachSeries(result.rows, function (post, callback) {
        //console.log(post);
        if (post.parent_id) {
            ForumPost.findOne({original_id: post.parent_id+10000}, function (err, parent) {
                if (parent) {
                    // this is a ForumReply, check if it is already added:
                    ForumPost.findOne({'replies.original_id': post.id+10000}, function (err, forumpost) {
                        if (err) {
                            callback(err);
                        } else {
                            var reply = {
                                created: post.created,
                                creator: 'nidarholm.' + post.user_id,
                                mdtext: post.content,
                                original_id: post.id+10000,
                                original_title: post.title,
                                original_slug: post.slug
                            };

                            if (forumpost) {
                                ForumPost.update({'replies.original_id': post.id+10000}, {$set: {'replies.$': reply}}, function (err, updated) {
                                    console.log("updated reply", post.id);
                                    callback(err);
                                });
                            } else {
                                parent.replies.push(reply);
                                parent.save(function (err) {
                                    if (err) {
                                        console.error(post, reply, parent, forumpost);
                                    }
                                    console.log("added new reply ", post.id);
                                    callback(err);
                                });
                            }
                        }
                    });
                } else {
                    ForumPost.findOne({'replies.original_id': post.parent_id+10000}, function (err, parent) {
                        var new_comment = new ForumComment();
                        new_comment.created = post.created;
                        new_comment.creator = 'nidarholm.' + post.user_id;
                        new_comment.mdtext = post.content;
                        new_comment.original_id = post.id+10000;
                        new_comment.original_title = post.title;
                        new_comment.original_slug = post.slug;

                        if (parent) {
                            var reply_index;
                            var reply = _.find(parent.replies, function (reply, i) {
                                //console.log(reply.original_id, post.parent_id, reply.original_id === post.parent_id);
                                if (reply.original_id === post.parent_id+10000) {
                                    reply_index = i;
                                    return true;
                                }
                            });
                            //console.log("r", reply);

                            // check if comment already exists:
                            var comment_index;
                            var comment = _.find(reply.comments, function (comment, i) {
                                if (comment.original_id === post.id+10000) {
                                    comment_index = i;
                                    return true;
                                }
                            });

                            //console.log(comment);
                            if (comment) {
                                console.log("update", post.id);
                                parent.replies[reply_index].comments[comment_index] = new_comment;
                            } else {
                                console.log("add", post.id);
                                parent.replies[reply_index].comments.push(new_comment);
                            }
                            parent.save(function (err) {
                                //console.log(parent);
                                callback(err);
                            });
                        } else {
                            //console.log("her");
                            ForumPost.findOne({'replies.comments.original_id': post.parent_id+10000}, {replies:{$elemMatch: {'comments.original_id': post.parent_id+10000}}}, function (err, parent) {
                                if (parent) {
                                    var reply_index;
                                    var reply = parent.replies[0];
                                    //console.error(parent.replies.length);
                                    //console.log("r", reply);

                                    // check if comment already exists:
                                    var comment_index;
                                    var comment = _.find(reply.comments, function (comment, i) {
                                        if (comment.original_id === post.id+10000) {
                                            comment_index = i;
                                            return true;
                                        }
                                    });

                                    if (comment) {
                                        ForumPost.update({'replies.comments.original_id': post.parent_id+10000}, {$set: {'replies.$.comments.$': new_comment}}, function (err, updated) {
                                            console.log("update inner", post.id);
                                            callback(err);
                                        });
                                        //parent.replies[0].comments[comment_index] = new_comment;
                                    } else {
                                        ForumPost.update({'replies.comments.original_id': post.parent_id+10000}, {$push: {'replies.$.comments': new_comment}}, function (err, updated) {
                                            console.log("add inner", post.id);
                                            callback(err);
                                        });
                                    }
                                } else {
                                    console.log("not found: ", post);
                                    callback(err);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            if (!post.title) {
                post.title = 'nidarholm.blank';
            }
            var new_post = {
                title: post.title,
                created: post.created,
                modified: post.updated,
                creator: 'nidarholm.' + post.user_id,
                original_slug: post.slug,
                tags: ['nyheter'],
                mdtext: post.content
            };
            if (!post.group_id) {
                _.extend(new_post, {permissions: {public: true, groups: [], users: []}});
                ForumPost.findOneAndUpdate({original_id: post.id+10000}, new_post, {upsert: true}, function (err, newpost) {
                    console.log("toppinnlegg: ", post.id);
                    if (err) {
                        console.error(err, post);
                    }
                    callback(err);
                });
            } else {
                Group.findOne({old_id: post.group_id}, function (err, group) {
                    _.extend(new_post, {permissions: {public: false, groups: [group.id], users: []}});
                    ForumPost.findOneAndUpdate({original_id: post.id+10000}, new_post, {upsert: true}, function (err, newpost) {
                        console.log("toppinnlegg: ", post.id);
                        if (err) {
                            console.error(err, post);
                        }
                        callback(err);
                    });
                });
            }
        }
    }, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("Done");
        }
        client.end();
        mongoose.connection.close();
        if (err) { return console.error(err); }
    });
  });
});
