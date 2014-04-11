var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    winston = require('winston'),
    config = require('../server/settings'),
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    ForumPost = require('../server/models/forum').ForumPost;

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
    client.query('SELECT * from news_story where parent_id is null order by id', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }

        async.each(result.rows, function (post, callback) {
            if (!post.title) {
                callback();
            } else {
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
                        log.debug("toppinnlegg: ", post.id);

                        if (err) {
                            console.error(err, post);
                        }
                        callback(err);
                    });
                } else {
                    Group.findOne({old_id: post.group_id}, function (err, group) {
                        _.extend(new_post, {permissions: {public: false, groups: [group.id], users: []}});
                        ForumPost.findOneAndUpdate({original_id: post.id+10000}, new_post, {upsert: true}, function (err, newpost) {
                            log.debug("toppinnlegg: ", post.id);

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
                log.error(err);
            }

            client.end();
            mongoose.connection.close();
        });
    });
});
