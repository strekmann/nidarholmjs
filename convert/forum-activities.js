var mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    marked = require('marked'),
    ForumPost = require('../server/models/forum').ForumPost,
    Activity = require('../server/models').Activity;

mongoose.connect('mongodb://localhost/nidarholm');

ForumPost.find({}, function (err, posts) {
    async.each(posts, function (post, callback) {

        var changes = [{user: post.creator, changed: post.created}];
        var modified = post.created;

        _.each(post.replies, function (reply) {
            changes.push({changed: reply.created, user: reply.creator});
            modified = reply.created;
            _.each(reply.comments, function (comment) {
                changes.push({changed: comment.created, user: comment.creator});
                modified = comment.created;
            });
        });

        //console.log(users);
        Activity.findOne({content_type: 'forum', content_ids: post._id}, function (err, activity) {

            if (!activity) {
                activity = new Activity();
                activity.content_type = 'forum';
                activity.content_ids.push(post._id);
            }
            activity.title = post.title;
            activity.changes = changes;
            activity.permissions = {
                users: post.permissions.users,
                groups: post.permissions.groups,
                public: post.permissions.public
            };
            activity.modified = modified;
            activity.tags = post.tags;

            var text = marked(post.mdtext).replace(/(<([^>]+)>)/ig,"");

            var snippet = text;
            if (text.length > 500) {
                snippet = text.slice(0, 500);

                var last_space = snippet.lastIndexOf(" ");
                snippet = text.slice(0, last_space);

                if (snippet.length < text.length) {
                    snippet += "…";
                }
            }
            activity.content = {
                snippet: snippet
            };

            activity.save(function (err) {
                //console.log(activity);
                callback(err);
            });
        });
    }, function (err) {
        if (err) {
            console.error(err);
        }
        mongoose.connection.close();
    });
});
