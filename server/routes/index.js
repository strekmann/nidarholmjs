var _ = require('underscore'),
    crypto = require('crypto'),
    moment = require('moment'),
    uuid = require('node-uuid'),
    nodemailer = require('nodemailer'),
    config = require('../settings'),
    User = require('../models').User,
    PasswordCode = require('../models').PasswordCode,
    ForumPost = require('../models/forum').ForumPost,
    Activity = require('../models').Activity,
    Project = require('../models/projects').Project,
    Event = require('../models/projects').Event;

// core routes - base is /
module.exports.index = function(req, res) {
    var query,
        meta = {
            title: req.organization.name,
            image: null,
            type: 'website'
        };
        if (req.organization.description && _.has(req.organization.description, req.lang)) {
            meta.description = req.organization.description[req.lang];
        }
    if (req.user) {  // we know the user
        query = Activity.find().or([
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ])
        .sort('-modified')
        .limit(20);
        if (req.query.page) {
            query = query.skip(20 * req.query.page);
        }
        query.populate('changes.user', 'name profile_picture_path').exec(function (err, activities) {
            if (err) {
                throw err;
            }

            query = Event.find().or([
                {creator: req.user},
                {'permissions.public': true},
                {'permissions.users': req.user._id},
                {'permissions.groups': { $in: req.user.groups }}
            ])
            .where({start: {$gt: moment().startOf('day')}})
            .sort('start')
            .limit(20);
            query.exec(function (err, events) {
                query = Project.find().or([
                    {'permissions.public': true},
                    {'permissions.users': req.user._id},
                    {'permissions.groups': { $in: req.user.groups }}
                ])
                .or([
                    {start: null},
                    {start: {$lt: moment().startOf('day')}}
                ])
                .where({end: {$gt: moment().startOf('day')}})
                .sort('end')
                .limit(2);
                query.exec(function (err, projects) {
                    res.format({
                        html: function () {
                            res.render('index', {
                                activities: activities,
                                projects: projects,
                                events: events,
                                meta: meta
                            });
                        },
                        json: function () {
                            // only activities, as this is called when users
                            // fetches more activites from the log
                            res.json(200, activities);
                        }
                    });
                });
            });
        });
    }
    else {
        query = Event
        .find({'permissions.public': true})
        .where({start: {$gt: moment().startOf('day')}})
        .sort('start')
        .limit(8);
        query.exec(function (err, events) {
            query = Project.find({'permissions.public': true})
            .or([
                {start: null},
                {start: {$lt: moment().startOf('day')}}
            ])
            .where({end: {$gt: moment().startOf('day')}})
            .sort('end')
            .limit(2);
            query.exec(function (err, projects) {
                ForumPost
                .find({'permissions.public': true, 'tags': config.news_tag})
                .sort('-created')
                .limit(5)
                .populate('creator', 'name username')
                .exec(function (err, posts) {
                    res.format({
                        html: function () {
                            res.render('index', {
                                news_tag: config.news_tag,
                                posts: posts,
                                projects: projects,
                                events: events,
                                meta: meta
                            });
                        }
                    });
                });
            });
        });
    }
};

module.exports.login = function(req, res){
    res.render('login', {meta: {title: 'Logg inn'}});
};

module.exports.logout = function(req, res){
    req.logout();
    req.session.destroy();
    res.redirect('/');
};

module.exports.google_callback = function(req, res){
    var url = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(url);
};

module.exports.register = function(req, res) {
    // TODO: Use sanitizer
    if (req.body.name && req.body.desired_username && req.body.password1 && req.body.password2) {
        var username = req.body.desired_username.toLowerCase();
        if (!username) {
            req.flash('error', 'Username missing');
            res.redirect('/login');
        } else {
            // Check if user already exists
            User.findOne({'username': username}).exec(function (err, otheruser) {
                if (otheruser) {
                    req.flash('error', req.gettext('Username already taken'));
                    res.redirect('/login');
                } else {
                    // Check if passwords are equal
                    var password1 = req.body.password1.trim();
                    var password2 = req.body.password2.trim();
                    if (password1 !== password2) {
                        req.flash('error', 'Passwords not equal');
                        res.redirect('/login');
                    } else {
                        // Hash password and save password, salt and hashing algorithm
                        var algorithm = 'sha1';
                        var salt = crypto.randomBytes(128).toString('base64');
                        var hashedPassword = crypto.createHash(algorithm);
                        hashedPassword.update(salt);
                        hashedPassword.update(password1);

                        var user = new User();
                        user.name = req.body.name.trim();
                        user.username = username;
                        user._id = user.username;
                        user.password = hashedPassword.digest('hex');
                        user.salt = salt;
                        user.algorithm = algorithm;
                        user.save(function (err) {
                            if (err) {
                                console.error("Error saving user:", err);
                            } else {
                                // Log in newly registered user automatically
                                req.logIn(user, function (err) {
                                    if(!err){
                                        // TODO: Since this is first login, redirect to account page
                                        req.flash('info', 'You are now registered, and logged in.');
                                        res.redirect('/');
                                    } else {
                                        req.flash('error', 'There was something wrong with your newly created user that prevented us from logging in for you. Please try to login yourself.');
                                        res.redirect('/login');
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }
    } else {
        req.flash('error', 'Information missing');
        res.redirect('/login');
    }
};

module.exports.forgotten_password = function (req, res) { // GET
    if (req.params.code) {
        // step 3 code sent back to server. will verify code, login user and redirect to new password form
        PasswordCode.findById(req.params.code, function (err, code) {
            if (err) {
                req.flash('error', err);
                res.redirect('/login/reset');
            }
            if (!code || code.created < moment().subtract('hours', 1)) {
                req.flash('error', 'Passordkoden er ugyldig. Du får prøve å lage en ny.');
                res.redirect('/login/reset');
            }
            // Log in automatically
            User.findById(code.user, function (err, user) {
                if (err) {
                    req.flash('error', 'Fant ikke brukeren');
                    res.redirect('/login/reset');
                }
                else {
                    req.logIn(user, function (err) {
                        if(!err){
                            res.redirect('/login/reset');
                        } else {
                            req.flash('error', 'Klarte ikke å logge deg inn');
                            res.redirect('/login/reset');
                        }
                    });
                }
            });
        });
    } else {
        // step 1 will present user with email password form
        var error;
        if (!config.auth.smtp.host) {
            error = 'Dette vi ikke virke, da serveren ikke kan sende epost nå.';
        }
        res.render('auth/newpassword', {error: error});
    }
};

module.exports.reset_password = function (req, res) { // POST
    if (req.user) {
        // Check if passwords are equal
        var password1 = req.body.password1.trim();
        var password2 = req.body.password2.trim();
        if (password1 !== password2) {
            req.flash('error', 'Passwords not equal');
            res.redirect('/login/reset');
        } else {
            // Hash password and save password, salt and hashing algorithm
            var algorithm = 'sha1';
            var salt = crypto.randomBytes(128).toString('base64');
            var hashedPassword = crypto.createHash(algorithm);
            hashedPassword.update(salt);
            hashedPassword.update(password1);

            req.user.password = hashedPassword.digest('hex');
            req.user.salt = salt;
            req.user.algorithm = algorithm;
            req.user.save(function (err) {
                if (err) {
                    console.error("Error saving user:", err);
                } else {
                    req.flash('info', 'Det nye passordet er tatt i bruk.');
                    res.redirect('/');
                }
            });
        }
    } else {
        if (req.body.email) {
            User.findOne({email: req.body.email}, function (err, user) {
                var code = new PasswordCode();
                code._id = uuid.v4();
                code.user = user._id;
                code.save(function (err) {
                    if (config.auth.smtp.host) {
                        var transporter = nodemailer.createTransport(config.auth.smtp);
                        var mail_options = {
                            from: config.auth.smtp.noreply_address,
                            to: user.name + '<' + user.email + '>',
                            subject: 'Nullstill passord',
                            text: 'Hei ' + user.name + '.\r\n\r\nNoen, forhåpentligvis du, har bedt om å nullstille passordet ditt. Hvis du ikke vil nullstille det, kan du se bort fra denne eposten. Hvis du vil nullstille passordet, kan du følge lenka under for å sette nytt passord:\r\n\r\n' + res.locals.address + '/login/reset/' + code._id,
                        };
                        transporter.sendMail(mail_options, function(error, info){
                            if (error) {
                                req.flash('error', 'Epost fungerte ikke');
                                res.redirect('/login/reset');
                            } else {
                                res.render('auth/newpassword', {email: user.email, debug: info.response});
                            }
                        });
                    }
                });
            });
        }
        else {
            req.flash("Email not sent");
            res.redirect('/login/reset');
        }
    }
};
