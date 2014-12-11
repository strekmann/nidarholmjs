var User = require('../models').User,
    RememberMeToken = require('../models').RememberMeToken,
    passport = require('passport'),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    config = require('../settings'),
    LocalStrategy = require('passport-local').Strategy,
    RememberMeStrategy = require('passport-remember-me').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    TwitterStrategy = require('passport-twitter').Strategy;

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

module.exports = function(){
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
            }
            return done(null, false, {message: 'Galt passord'});
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

    /*jslint unparam: true*/
    passport.use(new FacebookStrategy({
        clientID: config.auth.facebook.clientId,
        clientSecret: config.auth.facebook.clientSecret,
        callbackURL: config.auth.facebook.callbackURL,
        enablePoof: false,
        passReqToCallback: true
    }, function (req, accessToken, refreshToken, profile, done) {
        if (req.user) {
            req.user.facebook_id = profile.id;
            req.user.save(function (err, user) {
                req.session.returnTo = '/users/' + req.user.username;
                if (user) {
                    req.flash('success', 'Du kan nå logge inn med Facebook-kontoen');
                }
                return done(err, user);
            });
        }
        else {
            User.findOne({facebook_id: profile.id}, function (err, user) {
                if (!user) {
                    req.flash('error', 'Facebook-konto er ikke koblet mot Nidarholm-konto. Dette kan gjøres fra brukersiden etter at du har logget inn.');
                }
                return done(err, user);
            });
        }
    }));

    passport.use(new GoogleStrategy({
        clientID: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
        callbackURL: config.auth.google.callbackURL,
        passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
        if (req.user) {
            req.user.google_id = profile.id;
            req.user.save(function (err, user) {
                req.session.returnTo = '/users/' + req.user.username;
                if (user) {
                    req.flash('success', 'Du kan nå logge inn med Google-kontoen');
                }
                return done(err, user);
            });
        }
        else {
            User.findOne({google_id: profile.id}, function (err, user) {
                if (!user) {
                    req.flash('error', 'Google-konto er ikke koblet mot Nidarholm-konto. Dette kan gjøres fra brukersiden etter at du har logget inn.');
                }
                return done(err, user);
            });
        }
    }));

    passport.use(new TwitterStrategy({
        consumerKey: config.auth.twitter.clientId,
        consumerSecret: config.auth.twitter.clientSecret,
        callbackURL: config.auth.twitter.callbackURL,
        passReqToCallback: true
    }, function (req, token, tokenSecret, profile, done) {
        if (req.user) {
            req.user.twitter_id = profile.id;
            req.user.save(function (err, user) {
                req.session.returnTo = '/users/' + req.user.username;
                if (user) {
                    req.flash('success', 'Du kan nå logge inn med Twitter-kontoen');
                }
                return done(err, user);
            });
        }
        else {
            User.findOne({twitter_id: profile.id}, function (err, user) {
                if (!user) {
                    req.flash('error', 'Twitter-konto er ikke koblet mot Nidarholm-konto. Dette kan gjøres fra brukersiden etter at du har logget inn.');
                }
                return done(err, user);
            });
        }
    }));

    return passport;
};
