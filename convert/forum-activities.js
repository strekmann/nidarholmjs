var mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    ForumPost = require('../server/models/forum').ForumPost,
    Activity = require('../server/models').Activity;

mongoose.connect('mongodb://localhost/nidarholm');

ForumPost.find({}, function (err, posts) {
    async.each(posts, function (post, callback) {

        var changes = [post.created];
        var users = [post.creator];
        var modified = post.created;

        _.each(post.replies, function (reply) {
            changes.push(reply.created);
            users.push(reply.creator);
            modified = reply.created;
            _.each(reply.comments, function (comment) {
                changes.push(comment.created);
                users.push(comment.creator);
                modified = comment.created;
            });
        });

        //console.log(users);
        Activity.findOneAndUpdate({content_type: 'forum', content_id: post._id}, {
            title: post.title,
            users: users,
            changes: changes,
            permissions: {
                users: post.permissions.users,
                groups: post.permissions.groups,
                public: post.permissions.public
            },
            modified: modified
        }, {upsert: true}).exec(function (err, updated) {
            //console.log(updated);
            callback(err);
        });
    }, function (err) {
        if (err) {
            console.error(err);
        }
        mongoose.connection.close();
    });
});
