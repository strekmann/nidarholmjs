var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    toBase = require('short-mongo-id/lib/utils').toBase,
    config = require('../server/settings'),
    User = require('../server/models').User,
    Group = require('../server/models').Group;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client(config.convert.pg);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * from auth_group', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    async.each(result.rows, function (group, callback) {

        client.query('SELECT user_id from auth_user_groups where group_id='+group.id, function (err, user_result) {
            var members = _.map(user_result.rows, function (row) {
                return {user: 'nidarholm.' + row.user_id};
            });
            var g = {
                name: group.name,
                old_id: group.id,
                members: members
            };

            Group.findOneAndUpdate({_id: toBase(group.id, 64), old_id: group.id}, g, {upsert: true}, function (err, updated) {
                if (err) {
                    callback(err);
                }
                async.each(user_result.rows, function (row, cb) {
                    User.findByIdAndUpdate('nidarholm.' + row.user_id, {$addToSet: {groups: updated.id}}, function (err, user) {
                        //console.log(user);
                        cb (err);
                    });
                }, function (err) {
                    callback(err);
                });
            });
        });
    }, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log("Done");
        }
        client.end();
        mongoose.connection.close();
    });
  });
});
