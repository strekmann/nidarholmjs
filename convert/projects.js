var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    winston = require('winston'),
    config = require('../server/settings'),
    tagify = require('../server/lib/util').tagify,
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    Project = require('../server/models/projects').Project;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm");

var log = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({level: process.env.DEBUG ? 'debug' : 'info'})
    ]
});

var fetch_group = function (group_id) {
    var promise = new mongoose.Promise();

    if (!group_id) {
        var permissions = {public: true, users: [], groups: []};
        promise.complete(permissions);
    } else {
        Group.findOne({old_id: group_id}, function (err, group) {
            if(err) {
                promise.error(err);
                return;
            }
            permissions = {public: false, users: [], groups: [group.id]};
            promise.complete(permissions);
        });
    }
    return promise;
};

client.connect(function(err) {
    if(err) {
        return console.error('could not connect to postgres', err);
    }
    client.query('SELECT projects_project.*, tagging_tag.name from projects_project left outer join tagging_tag on projects_project.tag_id = tagging_tag.id order by projects_project.id', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }

        async.each(result.rows, function (p, callback) {
            var tag;
            var promise = fetch_group(p.group_id);
            var new_project = {
                title: p.title,
                created: p.created,
                modified: p.updated,
                creator: 'nidarholm.' + p.user_id,
                private_mdtext: p.content,
                start: p.start
            };
            if (p.name) {
                tag = tagify(p.name)[0];
            }
            promise.then(function (permissions) {
                new_project.permissions = permissions;
                client.query('SELECT * from projects_project_users WHERE project_id=' + p.id, function (err, result) {
                    if(err) {
                        return console.error('error running query', err);
                    }
                    new_project.original_project_users = _.map(result.rows, function (project_user) {
                        return 'nidarholm.' + project_user.user_id;
                    });

                    Project.update({end: p.end, _id: tag}, new_project, {upsert: true}, function (err, project) {

                        console.log(err, project);
                        callback(err);
                    });
                });
            });
        }, function (err) {
            if (err) {
                log.error(err);
            }

            client.end();
            mongoose.connection.close();
        });
    });
});
