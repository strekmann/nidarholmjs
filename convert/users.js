var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    config = require('../server/settings'),
    User = require('../server/models').User;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm");
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * from auth_user', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    async.each(result.rows, function (user, callback) {
        var new_user = {
            name: user.first_name + ' ' + user.last_name,
            username: user.username,
            email: user.email,
            is_active: user.is_active,
            created: user.date_joined
        };
        var pw_split = user.password.split('$');
        if (pw_split.length === 3) {
            new_user = _.extend(new_user, {
                algorithm: pw_split[0],
                salt: pw_split[1],
                password: pw_split[2]
            });
        }
        User.findByIdAndUpdate('nidarholm.' + user.id, new_user, {upsert: true}, function (err, betauser) {
            callback(err);
        });
    }, function (err) {
        console.log("Done");
        client.end();
        mongoose.connection.close();
        if (err) { return console.error(err); }
    });
  });
});
