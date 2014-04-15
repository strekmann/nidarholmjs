var pg = require('pg'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
    config = require('../server/settings'),
    fetch_city = require('../server/lib/util').fetch_city,
    User = require('../server/models').User;

mongoose.connect('mongodb://localhost/nidarholm');
var client = new pg.Client("postgres://nidarholm@localhost/nidarholm");

var postcode_cache = {};
var promise_city = function (postcode) {
    var promise = new mongoose.Promise();
    if (postcode) {
        if (_.has(postcode_cache, postcode)) {
            promise.complete(postcode_cache[postcode]);
        } else {
            fetch_city(postcode, function (err, city) {
                if (err) {
                    // no query run, invalid input or bad response
                    promise.complete();
                } else {
                    postcode_cache[postcode] = city;
                    promise.complete(city);
                }
            });
        }
    }
    else {
        promise.complete();
    }
    return promise;
};

client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * from auth_user inner join accounts_userprofile on auth_user.id=user_id', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    async.each(result.rows, function (user, callback) {
        var promise = promise_city(user.postcode);
        var new_user = {
            name: user.first_name + ' ' + user.last_name,
            username: user.username,
            email: user.email,
            is_active: user.is_active,
            created: user.date_joined,
            born: user.born,
            joined: user.joined,
            phone: user.cellphone,
            nmf_id: user.parent_organization_member_number,
            address: user.address,
            postcode: user.postcode,
            instrument_insurance: user.insured,
            reskontro: user.account,
            membership_history: user.history,
            membership_status: user.status,
            social_media: {
                website: user.personal_website
            }
        };
        promise.then(function(city) {
            if (city) {
                new_user.city = city;
            }
            var pw_split = user.password.split('$');
            if (pw_split.length === 3) {
                new_user = _.extend(new_user, {
                    algorithm: pw_split[0],
                    salt: pw_split[1],
                    password: pw_split[2]
                });
            }
            User.update({_id: 'nidarholm.' + user.user_id}, new_user, {upsert: true}, function (err, betauser) {
                callback(err);
            });
        });
    }, function (err) {
        console.log("Done");
        client.end();
        mongoose.connection.close();
        if (err) { return console.error(err); }
    });
  });
});
