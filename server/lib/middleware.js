// express middleware
var moment = require('moment'),
    uuid = require('node-uuid'),
    RememberMeToken = require('../models').RememberMeToken;

module.exports.ensureAuthenticated = function(req, res, next) {
    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    if (req.isAuthenticated()) { return next(); }
    req.session.returnTo = req.url;
    res.redirect('/login');
};

module.exports.persistentLogin = function (req, res, next) {
    if (req.body.username && !req.body.remember_me) { return next(); }
    var token = new RememberMeToken();
    token._id = uuid.v4();
    token.user = req.user._id;
    token.save(function(err) {
        if (err) { return done(err); }
        res.cookie('remember_me', token, { path: '/', httpOnly: true, maxAge: 604800000 }); // 7 days
        return next();
    });
};

module.exports.musicscoreadmin_middleware = function (req, res, next) {
    var organization = req.organization;
    if (!organization.musicadmin_group) {
        organization.musicadmin_group = organization.admin_group;
    }
    req.is_musicscoreadmin = res.locals.is_musicscoreadmin = _.some(organization.musicscoreadmin_group, function (member) {
        return member.user === req.user._id;
    });
    next();
};
