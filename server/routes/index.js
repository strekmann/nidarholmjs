var crypto = require('crypto'),
    moment = require('moment'),
    config = require('../settings'),
    User = require('../models').User,
    ForumPost = require('../models/forum').ForumPost,
    Activity = require('../models').Activity,
    Project = require('../models/projects').Project,
    Event = require('../models/projects').Event;

// core routes - base is /
module.exports.index = function(req, res) {
    var query,
        meta = {
            title: req.organization.name,
            description: req.organization.description[req.lang],
            image: null,
            type: 'website'
        };
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
            .limit(4);
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
        query = Event.find({'permissions.public': true})
        .where({start: {$gt: moment().startOf('day')}})
        .sort('start')
        .limit(20);
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
                                console.log("Error saving user:", err);
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
