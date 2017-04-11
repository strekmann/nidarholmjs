/* eslint no-param-reassign: 0 */

import config from 'config';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as RememberMeStrategy } from 'passport-remember-me';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as TwitterStrategy } from 'passport-twitter';

import RememberMeToken from '../models/RememberMeToken';
import User from '../models/User';

function fetchUser(userId, callback) {
    return User
    .findById(userId, 'name username profile_picture groups')
    .exec((err, user) => {
        if (err) {
            return callback(err.message, null);
        }
        if (!user) {
            return callback(`Could not find user ${userId}`);
        }
        return callback(null, user);
    });
}

passport.serializeUser((user, done) => {
    return done(null, user._id);
});

passport.deserializeUser((userId, done) => {
    return fetchUser(userId, done);
});

passport.passportLocal = new LocalStrategy({
    usernameField: 'email',
},
(email, password, done) => {
    // Log in using either email or username
    User.findOne()
    .or([{ email }, { username: email.toLowerCase() }])
    .select('+algorithm +password +salt')
    .exec((err, user) => {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'Ukjent e-postadresse eller brukernavn' });
        }
        return user.authenticate(password)
            .then((ok) => {
                if (ok) {
                    return done(null, user);
                }
                return done(null, false, { message: 'Galt passord' });
            })
            .catch((err) => {
                return done(err, false, { message: err.message });
            });
    });
});

if (config.auth.remember_me) {
    passport.use(new RememberMeStrategy((tokenId, done) => {
        RememberMeToken.findByIdAndRemove(tokenId, (err, token) => {
            if (err) { return done(err); }
            if (!token) { return done(null, false); }
            return fetchUser(token.user, done);
        });
    }, (user, done) => {
        const token = new RememberMeToken({ user });
        token.save((err) => {
            if (err) { return done(err); }
            return done(null, token._id);
        });
    }));
}

if (config.auth.facebook) {
    passport.use(new FacebookStrategy({
        clientID: config.auth.facebook.clientId,
        clientSecret: config.auth.facebook.clientSecret,
        callbackURL: config.auth.facebook.callbackURL,
        enablePoof: false,
        passReqToCallback: true,
    }, (req, accessToken, refreshToken, profile, done) => {
        if (req.user) {
            req.user.facebook_id = profile.id;
            req.user.save((err, user) => {
                return done(err, user);
            });
        }
        User.findOne({ facebook_id: profile.id }, (err, user) => {
            if (!user) {
                return done(new Error('Facebook-konto er ikke koblet mot Nidarholm-konto. Dette kan gjøres fra brukersiden etter at du har logget inn.'));
            }
            return done(err, user);
        });
    }));
}

if (config.auth.google) {
    passport.use(new GoogleStrategy({
        clientID: config.auth.google.clientId,
        clientSecret: config.auth.google.clientSecret,
        callbackURL: config.auth.google.callbackURL,
        passReqToCallback: true,
    }, (req, accessToken, refreshToken, profile, done) => {
        if (req.user) {
            req.user.google_id = profile.id;
            req.user.save((err, user) => {
                return done(err, user);
            });
        }
        User.findOne({ google_id: profile.id }, (err, user) => {
            if (!user) {
                return done(new Error('Google-konto er ikke koblet mot Nidarholm-konto. Dette kan gjøres fra brukersiden etter at du har logget inn.'));
            }
            return done(err, user);
        });
    }));
}

if (config.auth.twitter) {
    passport.use(new TwitterStrategy({
        consumerKey: config.auth.twitter.clientId,
        consumerSecret: config.auth.twitter.clientSecret,
        callbackURL: config.auth.twitter.callbackURL,
        passReqToCallback: true,
    }, (req, token, tokenSecret, profile, done) => {
        if (req.user) {
            req.user.twitter_id = profile.id;
            req.user.save((err, user) => {
                if (user) {
                    req.flash('success', 'Du kan nå logge inn med Twitter-kontoen');
                }
                return done(err, user);
            });
        }
        User.findOne({ twitter_id: profile.id }, (err, user) => {
            if (!user) {
                req.flash('error', `Twitter-konto er ikke koblet mot Nidarholm-konto.
                          Dette kan gjøres fra brukersiden etter at du har logget inn.`);
            }
            return done(err, user);
        });
    }));
}

passport.use(passport.passportLocal);
export default passport;
