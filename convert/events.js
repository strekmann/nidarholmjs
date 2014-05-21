var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    winston = require('winston'),
    config = require('../server/settings'),
    tagify = require('../server/lib/util').tagify,
    User = require('../server/models').User,
    Group = require('../server/models').Group,
    Event = require('../server/models/projects').Event;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client(config.convert.pg);

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
    client.query('SELECT events_event.*, tagging_tag.name from events_event left outer join projects_project on (events_event.project_id=projects_project.id) left outer join tagging_tag on (projects_project.tag_id=tagging_tag.id) order by events_event.id', function(err, result) {
        if(err) {
            return console.error('error running query', err);
        }

        async.each(result.rows, function (event, callback) {
            var promise = fetch_group(event.group_id);
            var new_event = {
                end: event.end,
                original_whole_day: event.whole_day,
                original_event_serie: event.event_serie,
                location: event.location,
                creator: 'nidarholm.' + event.user_id,
                created: event.created,
                mdtext: event.content
            };
            if (event.project_id) {
                new_event.tags = tagify(event.name);
            }
            if (event.category_id) {
                new_event.original_event_category = event.category_id;
            }
            promise.then(function (permissions) {
                new_event.permissions = permissions;
                Event.update({start: event.start, title: event.title}, new_event, {upsert: true}, function (err, ev) {
                    callback(err);
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
