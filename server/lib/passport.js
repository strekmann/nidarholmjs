var User = require('../models').User,
    passport = require('passport'),
    crypto = require('crypto'),
    LocalStrategy = require('passport-local').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

module.exports = function(app){
    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, 'name username profile_picture_path groups friends', function(err, user){
            if (err) {
                return done(err.message, null);
            }
            if (!user) {
                return done("Could not find user "+ id);
            }
            done(null, user);
        });
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

    return passport;
};
