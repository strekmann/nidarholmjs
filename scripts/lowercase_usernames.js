var mongoose = require('mongoose'),
    async = require('async'),
    User = require('../server/models').User;

mongoose.connect('mongodb://localhost/nidarholm');

User.find(function (err, users) {
    async.each(users, function (user, callback) {
        user.username = user.username.toLowerCase();
        user.save(function (err) {
            console.log(err, user.username);
            callback(err);
        });
    }, function (err) {
        console.log(err, 'done');
        mongoose.connection.close();
    });
});
