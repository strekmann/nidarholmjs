var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    winston = require('winston'),
    config = require('../server/settings'),
    shortid = require('short-mongo-id'),
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    File = require('../server/models/files').File,
    ForumPost = require('../server/models/forum').ForumPost;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client(config.convert.pg);

var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: process.env.DEBUG ? 'debug' : 'info'})
    ]
});

var replacer = function (match, description, path) {
    console.log(match);
    var old_id = path.split("/").shift();
    File.findOne({old_id: old_id}, function (err, file) {
        if (err) {
            throw err;
        }
        if (file) {
            if (!description) {
                description = file.filename;
            }
            var newstring = "[![" + description + "](/files/n/" + file.hash + "/" + file.filename + ")](/files/" + file._id + ")";
            console.log(newstring);
            return newstring;
        }
        else {
            console.log("replaced by nothing");
            return "replaced by nothing";
        }
    });
};

var convert_temporary_markdown_syntax = function (string) {
    var newstring = string.replace(/\!\[(.*?)\]\[(\d+(?:\/\d+)?)\]/g, replacer);
    if (newstring.match(/\!\[/)) {
        console.log(newstring);
    }
    if (newstring.match("replaced by nothing")) {
        console.log("we have replaced");
    }
    return newstring;
};

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
                    mdtext: convert_temporary_markdown_syntax(post.content)
                };
                if (!post.group_id) {
                    _.extend(new_post, {permissions: {public: true, groups: [], users: []}});
                    ForumPost.findOneAndUpdate({original_id: post.id+10000}, new_post, function (err, newpost) {
                        log.debug("toppinnlegg: ", post.id);

                        if (!newpost) {
                            _.extend(new_post, {_id: shortid(), original_id: post.id+10000});
                            ForumPost.create(new_post, function (err, newpost) {
                                callback(err);
                            });
                        }
                        else {
                            if (err) {
                                console.error(err, post, newpost);
                            }

                            callback(err);
                        }
                    });
                } else {
                    Group.findOne({old_id: post.group_id}, function (err, group) {
                        _.extend(new_post, {permissions: {public: false, groups: [group.id], users: []}});
                        ForumPost.findOneAndUpdate({original_id: post.id+10000}, new_post, function (err, newpost) {
                            log.debug("toppinnlegg: ", post.id);
                            if (!newpost) {
                                _.extend(new_post, {_id: shortid(), original_id: post.id+10000});
                                ForumPost.create(new_post, function (err, newpost) {
                                    callback(err);
                                });
                            }
                            else {
                                if (err) {
                                    console.error(err, post, newpost);
                                }

                                callback(err);
                            }
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
