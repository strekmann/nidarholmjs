var _ = require('underscore'),
    async = require('async'),
    crypto = require('crypto'),
    moment = require('moment'),
    uuid = require('node-uuid'),
    nodemailer = require('nodemailer'),
    shortid = require('short-mongo-id'),
    config = require('../settings'),
    User = require('../models').User,
    PasswordCode = require('../models').PasswordCode,
    ForumPost = require('../models/forum').ForumPost,
    Activity = require('../models').Activity,
    File = require('../models/files').File,
    Project = require('../models/projects').Project,
    _Event = require('../models/projects').Event;

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
        query.populate('changes.user', 'name profile_picture_path')
        .populate('project', 'year tag title')
        .exec(function (err, activities) {
            if (err) {
                throw err;
            }

            query = _Event.find().or([
                {creator: req.user},
                {'permissions.public': true},
                {'permissions.users': req.user._id},
                {'permissions.groups': { $in: req.user.groups }}
            ])
            .where({start: {$gte: moment().startOf('day'), $lte: moment().add(6, 'months').startOf('day').toDate()}})
            .sort('start');
            query.exec(function (err, events) {
                query = Project.find().or([
                    {'permissions.public': true},
                    {'permissions.users': req.user._id},
                    {'permissions.groups': { $in: req.user.groups }}
                ])
                .or([
                    {start: null},
                    {start: {$lte: moment().startOf('day').toDate()}}
                ])
                .where({end: {$gte: moment().startOf('day').toDate()}})
                .sort('end')
                .limit(2);
                query
                .populate('creator', 'name username')
                .exec(function (err, projects) {
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
        query = _Event
        .find({'permissions.public': true})
        .where({start: {$gte: moment().startOf('day')}})
        .sort('start')
        .limit(8);
        query.exec(function (err, events) {
            query = Project.find({'permissions.public': true})
            .or([
                {start: null},
                {start: {$lte: moment().startOf('day')}}
            ])
            .where({end: {$gte: moment().startOf('day')}})
            .sort('end')
            .limit(2);
            query.lean().exec(function (err, projects) {
                ForumPost
                .find({'permissions.public': true, 'tags': config.news_tag})
                .sort('-created')
                .limit(5)
                .populate('creator', 'name username')
                .exec(function (err, posts) {
                    res.format({
                        html: function () {
                            _.each(projects, function (project) {
                                project.concerts = [];
                                _.each(events, function (event) {
                                    if (_.contains(event.tags, project.tag) && _.contains(event.tags, 'konsert')) {
                                        project.concerts.push(event);
                                    }
                                });
                            });
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
    res.clearCookie('remember_me');
    res.redirect('/');
};

module.exports.check_email = function (req, res, next) {
    var pattern = new RegExp(req.body.email, 'i');
    User.findOne({email: {$regex: pattern}}, function (err, user) {
        if (err) {
            return next(err);
        }
        if (user) {
            res.status(200).json({status: true});
        }
        else {
            res.status(200).json({status: false});
        }
    });
};

module.exports.tagsearch = function (req, res) {
    if (req.is_member) {
        if (req.query.q) {
            var pattern = RegExp('^' + req.query.q);
            async.parallel({
                project_tags: function (callback) {
                    Project.find().select('tag').exec(function (err, projects) {
                        var matches = _.reduce(projects, function (memo, project) {
                            if (project.tag && project.tag.match(pattern)) {
                                memo.push(project.tag);
                            }
                            return memo;
                        }, []);
                        callback(err, matches);
                    });
                },
                forum_tags: function (callback) {
                    ForumPost.distinct('tags', function (err, tags) {
                        var matches = _.filter(tags, function (tag) {
                            return tag.match(pattern);
                        });
                        callback(err, matches);
                    });
                },
                files_tags: function (callback) {
                    File.distinct('tags', function (err, tags) {
                        var matches = _.filter(tags, function (tag) {
                            return tag.match(pattern);
                        });
                        callback(err, matches);
                    });
                }
            }, function (err, results) {
                if (err) {
                    console.error(err);
                    res.json(500, err);
                }
                else {
                    var tags = _.flatten(results);
                    res.json(200, {tags: tags});
                }
            });
        }
        else {
            res.json(400, {});
        }
    }
    else {
        res.json(403, {});
    }
};

module.exports.register = function(req, res) {
    // TODO: Use sanitizer
    if (req.body.email && req.body.name && req.body.password1 && req.body.password2) {
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
            user.email = req.body.email.trim();
            user.name = req.body.name.trim();
            user.username = req.body.email.trim();
            user._id = shortid();
            user.password = hashedPassword.digest('hex');
            user.salt = salt;
            user.algorithm = algorithm;
            user.save(function (err) {
                if (err) {
                    console.error("Error saving user:", err);
                    return next(err);
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
            if (!code || code.created < moment().subtract(1, 'hours')) {
                req.flash('error', 'Passordkoden er ugyldig. Du får prøve å lage en ny.');
                res.redirect('/login/reset');
            }
            if (code) {
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
            }
            else {
                console.error("should really never get here, but didn't we?");
                res.redirect('/login/reset');
            }
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
            var pattern = new RegExp(req.body.email, 'i');
            User.findOne({email: {$regex: pattern}}, function (err, user) {
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
                            text: 'Hei ' + user.name + '.\r\n\r\nNoen, forhåpentligvis du, har bedt om å nullstille passordet ditt. Hvis du ikke vil nullstille det, kan du se bort fra denne eposten. Hvis du vil nullstille passordet, kan du følge lenka under for å sette nytt passord:\r\n\r\n' + res.locals.address + '/login/reset/' + code._id + '\r\n\r\nBrukernavnet ditt er: ' + user.username,
                        };
                        transporter.sendMail(mail_options, function(error, info){
                            res.format({
                                html: function () {
                                    if (error) {
                                        req.flash('error', 'Epost fungerte ikke');
                                        res.redirect('/login/reset');
                                    } else {
                                        res.render('auth/newpassword', {email: user.email, debug: info.response});
                                    }
                                },
                                json: function () {
                                    if (error) {
                                        res.status(500).json({error: error});
                                    }
                                    else {
                                        res.status(200).json({status: true});
                                    }
                                }
                            });
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
