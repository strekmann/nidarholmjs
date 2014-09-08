var User = require('../models').User,
    RememberMeToken = require('../models').RememberMeToken,
    passport = require('passport'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    LocalStrategy = require('passport-local').Strategy,
    RememberMeStrategy = require('passport-remember-me').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var fetchUser = function (user_id, callback) {
    User.findById(user_id, 'name username profile_picture_path groups friends', function(err, user){
        if (err) {
            return callback(err.message, null);
        }
        if (!user) {
            return callback("Could not find user "+ user_id);
        }
        callback(null, user);
    });
};

module.exports = function(app){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(user_id, done) {
        fetchUser(user_id, done);
    });

    passport.use(new LocalStrategy(function (email, password, done) {
        // Log in using either email or username
        User.findOne()
        .or([{email: email}, {username: email.toLowerCase()}])
        .exec(function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {message: 'Ukjent e-postadresse eller brukernavn'});
            }
            var hashedPassword = crypto.createHash(user.algorithm);
            hashedPassword.update(user.salt);
            hashedPassword.update(password);
            if (user.password === hashedPassword.digest('hex')) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Galt passord'});
            }
        });
    }));

    passport.use(new RememberMeStrategy(function(token_id, done) {
        RememberMeToken.findByIdAndRemove(token_id, function (err, token) {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }
            fetchUser(token.user, done);
        });
    }, function(user, done) {
        var token = new RememberMeToken();
        token._id = uuid.v4();
        token.user = user._id;
        token.save(function(err) {
            if (err) { return done(err); }
            return done(null, token._id);
        });
    }));

    return passport;
};
