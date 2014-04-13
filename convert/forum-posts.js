var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    winston = require('winston'),
    config = require('../server/settings'),
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    ForumPost = require('../server/models/forum').ForumPost,
    ForumComment = require('../server/models/forum').ForumComment;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm");

var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: process.env.DEBUG ? 'debug' : 'info'})
    ]
});

var tagify = function (tagstring) {
    return _.map(tagstring.split(","), function (tag) {
        return tag.toLowerCase().replace(/\s+/, '').replace(/\-\_\(\)\#\.\%\\\/\$\"\'\*/, '');
    });
};

client.connect(function(err) {
    if(err) {
        return console.error('could not connect to postgres', err);
    }
    client.query('SELECT * from s7n_forum order by id', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }

        async.each(result.rows, function (post, callback) {
            var new_post = {
                title: post.title,
                created: post.created_date,
                modified: post.updated_date,
                creator: 'nidarholm.' + post.user_id,
                tags: tagify(post.tags),
                original_slug: post.slug,
                mdtext: post.content
            };
            if (!post.group_id) {
                _.extend(new_post, {permissions: {public: true, groups: [], users: []}});
                ForumPost.findOneAndUpdate({original_id: post.id}, new_post, {upsert: true}, function (err, newpost) {
                    log.debug("toppinnlegg: ", post.id);

                    if (err) {
                        console.error(err, post, newpost);
                    }

                    callback(err);
                });
            } else {
                Group.findOne({old_id: post.group_id}, function (err, group) {
                    _.extend(new_post, {permissions: {public: false, groups: [group.id], users: []}});
                    ForumPost.findOneAndUpdate({original_id: post.id}, new_post, {upsert: true}, function (err, newpost) {
                        log.debug("toppinnlegg: ", post.id);

                        if (err) {
                            console.error(err, post, newpost);
                        }

                        callback(err);
                    });
                });
            }
        }, function (err) {
            if (err) {
                log.error(err);
            }

            client.end();
            mongoose.connection.close();
        });
    });
});