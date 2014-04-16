var uslug = require('uslug'),
    moment = require('moment'),
    util = require('../lib/util'),
    upload_file = util.upload_file,
    config = require('../settings'),
    Project = require('../models/projects').Project,
    Event = require('../models/projects').Event,
    File = require('../models/files').File,
    ForumPost = require('../models/forum').ForumPost;

// TODO: Create file util functions
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto');

module.exports.index = function (req, res, next) {
    Project.find().exec(function (err, projects) {
        if (err) {
            return next(err);
        }
        res.format({
            json: function () {
                res.json(200, projects);
            },
            html: function () {
                res.render('projects/index', {
                    projects: projects
                });
            }
        });
    });
};

module.exports.create_project = function (req, res, next) {
    var title = req.body.title,
        tag = req.body.tag || req.body.title,
        permissions = util.parse_web_permissions(req.body.permissions),
        private_mdtext = req.body.private_mdtext,
        public_mdtext = req.body.public_mdtext,
        start = req.body.start,
        end = req.body.end;

    var project = new Project();
    project.title = title;
    project._id = uslug(tag);
    project.private_mdtext = private_mdtext;
    project.public_mdtext = public_mdtext;
    project.start = start;
    project.end = end;
    project.permissions = permissions;
    project.creator = req.user;

    project.save(function (err) {
        if (err) { return next(err); }
        res.format({
            json: function () {
                res.json(200, project);
            },
            html: function () {
                res.redirect('/projects/' + project._id);
            }
        });
    });
};

module.exports.delete_project = function (req, res, next) {
    var id = req.params.id;

    Project.findByIdAndRemove(id, function (err, project) {
        if (err) { return next(err); }
        res.json(200, project);
    });
};

module.exports.project = function (req, res, next) {
    var id = req.params.id;

    Project.findById(id).lean().exec(function (err, project) {
        if (err) { return next(err); }
        Event.find({tags: project._id}).populate('creator', 'username name').exec(function (err, events) {
            //project = project.toObject();
            project.events = events;
            ForumPost.find({tags: project._id}).populate('creator', 'username name').exec(function (err, posts) {
                project.posts = posts;
                File.find({tags: project._id}).populate('creator', 'username name').exec(function (err, files) {
                    project.files = files;
                    res.format({
                        json: function () {
                            res.json(200, project);
                        },
                        html: function () {
                            res.render('projects/project', {
                                project: project
                            });
                        }
                    });
                });
            });
        });
    });
};

module.exports.project_create_event = function (req, res, next) {
    var id = req.params.id,
        title = req.body.title,
        location = req.body.location,
        start = req.body.start,
        end = req.body.end,
        mdtext = req.body.mdtext;

    Project.findById(id, function (err, project) {
        if (err) { return next(err); }

        var event = new Event();
        event.tags = [project._id];
        event.title = title;
        event.location = location;
        event.start = start;
        event.end = end;
        event.mdtext = mdtext;
        event.creator = req.user;

        event.save(function (err) {
            if (err) { return next(err); }
            res.format({
                json: function () {
                    res.json(200, event);
                },
                html: function () {
                    req.flash('success', 'Aktiviteten ble lagret');
                    res.redirect('/projects/' + project._id);
                }
            });
        });
    });
};

// TODO: Only hide. Or remove project tag. Or ask.
module.exports.project_delete_event = function (req, res, next) {
    var event_id = req.params.event_id;
    Event.findByIdAndRemove(event_id, function (err, event) {
        if (err) { return next(err); }
        res.json(200, event);
    });
};

// TODO: Add ical format? How to find URL to it?
module.exports.events = function (req, res, next) {
    var query = Event.find().or([
        {creator: req.user},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ])
        .where({start: {$gt: moment().startOf('day')}})
        .sort('start')
        .populate('creator', 'username name')
        .limit(20);
    if (req.query.page) {
        query = query.skip(20 * req.query.page);
    }
    query.exec(function (err, events) {
        if (err) {
            throw err;
        }
        res.format({
            html: function () {
                res.render('projects/events', {events: events});
            },
            json: function () {
                res.json(200, events);
            }
        });
    });
};

module.exports.event = function (req, res, next) {
    Event.findById(req.params.id, function (err, event) {
        if (err) {
            return next(err);
        }
        res.format({
            html: function () {
                res.render('projects/event', {event: event});
            }
        });
    });
};

module.exports.project_create_post = function (req, res, next) {
    var id = req.params.id,
        title = req.body.title,
        mdtext = req.body.mdtext;

    Project.findById(id, function (err, project) {
        if (err) { return next(err); }
        var post = new ForumPost();
        post.title = title;
        post.mdtext = mdtext;
        post.permissions = project.permissions;
        post.creator = req.user;
        post.tags.push(project._id);
        post.save(function (err) {
            if (err) { return next(err); }
            post.populate('creator', 'username name', function (err, post) {
                if (err) { return next(err); }
                res.format({
                    html: function () {
                        res.redirect('/projects/' + project._id);
                    },
                    json: function () {
                        res.json(200, post);
                    }
                });
            });
        });
    });
};
//
// TODO: Only hide. Or remove project tag. Or ask.
module.exports.project_delete_post = function (req, res, next) {
    var post_id = req.params.post_id;
    ForumPost.findByIdAndRemove(post_id, function (err, event) {
        if (err) { return next(err); }
        res.json(200, event);
    });
};

module.exports.project_create_file = function (req, res, next) {
    var id = req.params.id;

    Project.findById(id, function (err, project) {
        upload_file(req.files.file.path, req.files.file.originalname, config.files.path_prefix, req.user, project.permissions, [project._id], function (err, file) {
            if (err) { throw err; }
            res.json(200, file);
        });
    });
};
