var uslug = require('uslug'),
    moment = require('moment'),
    _ = require('underscore'),
    shortid = require('short-mongo-id'),
    util = require('../lib/util'),
    upload_file = util.upload_file,
    config = require('../settings'),
    snippetify = require('../lib/util').snippetify,
    Project = require('../models/projects').Project,
    CalendarEvent = require('../models/projects').Event,
    Piece = require('../models/projects').Piece,
    File = require('../models/files').File,
    ForumPost = require('../models/forum').ForumPost,
    Activity = require('../models').Activity;

// TODO: Create file util functions
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    crypto = require('crypto');

module.exports.index = function (req, res, next) {
    var query;
    if (req.user) {
        query = Project.find().or([
            {creator: req.user},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = Project.find().or({'permissions.public': true});
    }
    query.where({end: {$gte: moment().startOf('day')}});
    query.sort('end')
        .populate('creator', 'username name');
    query.exec(function (err, projects) {
        if (err) {
            throw err;
        }

        res.format({
            html: function () {
                if (req.user) {
                    query = Project.find().or([
                        {creator: req.user},
                        {'permissions.public': true},
                        {'permissions.users': req.user._id},
                        {'permissions.groups': { $in: req.user.groups }}
                    ]);
                }
                else {
                    query = Project.find({'permissions.public': true});
                }
                query.where({end: {$lt: moment().startOf('day')}});
                query.sort('-end')
                    .populate('creator', 'username name');

                query.exec(function (err, previous_projects) {
                    if (err) {
                        throw err;
                    }

                    res.render('projects/index', {
                        projects: projects,
                        previous_projects: previous_projects,
                        meta: {title: 'Prosjekter'}
                    });
                });
            },
            json: function () {
                res.json(projects);
            }
        });
    });
};

/*
module.exports.year = function (req, res, next) {
    var year = req.params.year;

    if (req.user) {
        query = Project.find({year: year}).or([
            {creator: req.user},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = Project.find().or({'permissions.public': true});
    }
    query.sort('-end')
        .populate('creator', 'username name');

    query.exec(function (err, projects) {
        if (err) {
            res.sendStatus(500);
        }
        else {
            res.json(projects);
        }
    });
};
*/

module.exports.create_project = function (req, res, next) {
    if (!req.is_member) {
        res.sendStatus(403);
    }
    else if (!req.body.end) {
        res.status(400).json({error: 'Project end time is missing'});
    }
    else {
        var project = new Project();
        project.title = req.body.title;
        if (req.body.tag) {
            project.tag = uslug(req.body.tag);
        }
        else {
            project.tag = uslug(req.body.title);
        }
        project.private_mdtext = req.body.private_mdtext;
        project.public_mdtext = req.body.public_mdtext;
        if (req.body.start) {
            project.start = moment(req.body.start);
        }
        if (req.body.end) {
            var end = moment(req.body.end);
            project.end = end;
            project.year = end.year();
        }
        project.permissions = util.parse_web_permissions(req.body.permissions);
        project.creator = req.user;

        project.save(function (err) {
            if (err) {
                res.status(400).json(err);
            }
            res.format({
                json: function () {
                    res.json(project);
                },
                html: function () {
                    res.redirect('/projects/' + project._id);
                }
            });
        });
    }
};

module.exports.update_project = function (req, res, next) {
    Project.findById(req.params.id, function (err, project) {
        if (err) { return next(err); }

        if (project.creator === req.user || req.is_admin) {
            var title = req.body.title,
                tag = req.body.tag,
                permissions = util.parse_web_permissions(req.body.permissions),
                private_mdtext = req.body.private_mdtext,
                public_mdtext = req.body.public_mdtext,
                start = req.body.start,
                end = req.body.end,
                year = moment(end).year();

            project.title = title;
            project.tag = tag;
            project.private_mdtext = private_mdtext;
            project.public_mdtext = public_mdtext;
            project.start = start;
            project.end = end;
            project.year = year;
            project.permissions = permissions;

            project.save(function (err) {
                if (err) { return next(err); }
                res.json(project);
            });
        }
        else {
            res.sendStatus(403);
        }
    });
};

module.exports.delete_project = function (req, res, next) {
    var id = req.params.id;

    Project.findByIdAndRemove(id, function (err, project) {
        if (err) { return next(err); }
        res.json(project);
    });
};

module.exports.project = function (req, res, next) {
    var year = req.params.year,
        tag = req.params.tag;

    var query = Project.findOne({year: year, tag: tag});
    if (req.user) {
        query = query.or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = query.where({'permissions.public': true});
    }
    query = query.populate('music.piece');
    query = query.populate('poster');
    query.exec(function (err, project) {
        if (err) { return next(err); }
        if (!project) {
            res.sendStatus(404);
        }
        else {
            var event_query = CalendarEvent.find({tags: project.tag});

            if (req.user) {
                event_query = event_query.or([
                    {creator: req.user._id},
                    {'permissions.public': true},
                    {'permissions.users': req.user._id},
                    {'permissions.groups': { $in: req.user.groups }}
                ]);
            } else {
                event_query = event_query.where({'permissions.public': true});
            }
            event_query.populate('creator', 'username name')
            .sort('start')
            .exec(function (err, events) {
                ForumPost.find({tags: project.tag}).populate('creator', 'username name').sort('-created').exec(function (err, posts) {
                    var images = [];
                    var non_images = [];
                    File.find({tags: project.tag}).populate('creator', 'username name').exec(function (err, files) {
                        res.format({
                            json: function () {
                                res.json(project);
                            },
                            html: function () {
                                res.render('projects/project', {
                                    project: project,
                                    events: events,
                                    posts: posts,
                                    files: files,
                                    meta: {title: project.title}
                                });
                            }
                        });
                    });
                });
            });
        }
    });
};

module.exports.project_create_event = function (req, res, next) {
    if (!req.is_member) {
        res.send(403, 'Forbidden');
    }
    else {
        var id = req.params.id,
            title = req.body.title,
            location = req.body.location,
            start = req.body.start,
            end = req.body.end,
            mdtext = req.body.mdtext;

        Project.findById(id, function (err, project) {
            if (err) { return next(err); }

            var event = new CalendarEvent();
            event.tags = [project.tag];
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
                        res.json(event);
                    },
                    html: function () {
                        req.flash('success', 'Aktiviteten ble lagret');
                        res.redirect('/projects/' + project._id);
                    }
                });
            });
        });
    }
};

module.exports.project_create_post = function (req, res, next) {
    var id = req.params.id,
        title = req.body.title,
        mdtext = req.body.mdtext;

    Project.findById(id, function (err, project) {
        if (err) {
            res.status(400).json(err);
        }
        var post = new ForumPost();
        post._id = shortid();
        post.title = title;
        post.mdtext = mdtext;
        post.permissions = project.permissions;
        post.creator = req.user;
        post.tags = [project.tag];
        post.save(function (err) {
            if (err) { return next(err); }
            var activity = new Activity();
            activity.content_type = 'forum';
            activity.content_ids = [post._id];
            activity.title = post.title;
            activity.changes = [{user: post.creator, changed: post.created}];
            activity.permissions = post.permissions;
            activity.tags = post.tags;
            activity.project = project._id;
            activity.modified = post.created;
            activity.content = {
                snippet: snippetify(post.mdtext)
            };
            activity.save(function (err) {});
            post.populate('creator', 'username name', function (err, post) {
                if (err) {
                    res.status(400).json(err);
                }
                else {
                    res.format({
                        html: function () {
                            res.redirect('/projects/' + project._id);
                        },
                        json: function () {
                            res.json(post);
                        }
                    });
                }
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
        res.json(event);
    });
};

module.exports.project_create_file = function (req, res, next) {
    if (!req.user) {
        res.sendStatus(403);
    }
    else {
        Project.findById(req.params.id)
        .or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]).exec(function (err, project) {
            if (err) { throw err; }
            var filepath = req.files.file.path,
                filename = req.files.file.originalname,
                user = req.user;

            var options = {
                permissions: project.permissions,
                tags: [project.tag]
            };
            upload_file(filepath, filename, user, options, function (err, file) {
                if (err) { throw err; }
                Activity.findOne({
                    content_type: 'upload',
                    'changes.user': file.creator,
                    modified: {$gt: moment(file.created).subtract(10, 'minutes').toDate()},
                    project: project._id
                }, function (err, activity) {

                    if (!activity) {
                        activity = new Activity();
                        activity.content_type = 'upload';
                    }

                    activity.content_ids.push(file._id);
                    activity.title = file.filename;
                    activity.project = project._id;
                    activity.changes.push({user: req.user, changed: file.created});
                    activity.permissions = file.permissions;
                    activity.modified = file.created;

                    if (file.tags) {
                        _.each(file.tags, function (tag) {
                            activity.tags.addToSet(tag);
                        });
                    }

                    if (!activity.content) {
                        activity.content = {};
                    }

                    if (file.is_image) {
                        if (!activity.content.images) {
                            activity.content.images = [];
                        }
                        var image_already_there = _.find(activity.content.images, function (image) {
                            return image.thumbnail_path === file.thumbnail_path;
                        });
                        if (!image_already_there) {
                            activity.content.images.push({thumbnail_path: file.thumbnail_path, _id: file._id});
                        }
                    }
                    else {
                        if (!activity.content.non_images) {
                            activity.content.non_images = [];
                        }
                        var already_there = _.find(activity.content.non_images, function (non_image) {
                            return non_image.filename === file.filename;
                        });
                        if (!already_there) {
                            activity.content.non_images.push({filename: file.filename, _id: file._id});
                        }
                    }
                    activity.markModified('content');
                    activity.save(function (err) {});
                });

                res.json(file);
            });
        });
    }
};

module.exports.add_piece = function (req, res, next) {
    if (!req.is_member) {
        res.send(403, 'Forbidden');
    }
    else {
        Piece.findById(req.body._id, function (err, piece) {
            if (err) { return next(err); }
            Project.findById(req.params.project_id, function (err, project) {
                if (err) { return next(err); }
                project.music.addToSet({piece: piece._id});
                project.save(function (err) {
                    if (err) { return next(err); }
                    var music = {
                        piece: piece
                    };
                    res.json(music);
                });
            });
        });
    }
};

module.exports.remove_piece = function (req, res, next) {
    if (!req.is_member) {
        res.sendStatus(403);
    }
    else {
        Project.findById(req.params.project_id, function (err, project) {
            if (err) { return next(err); }
            project.music.pull(req.body._id);
            project.save(function (err) {
                if (err) { return next(err); }
                res.format({
                    html: function () {
                        res.sendStatus(200);
                    },
                    json: function () {
                        res.json({});
                    }
                });
            });
        });
    }
};

module.exports.set_poster = function (req, res, next) {
    if (!req.is_member) {
        res.sendStatus(403);
    }
    else {
        Project.findById(req.params.id, function (err, project) {
            if (err) { return next(err); }
            project.poster = req.body.image_id;
            project.save(function (err) {
                if (err) { return next(err); }
                res.format({
                    html: function () {
                        res.sendStatus(200);
                    },
                    json: function () {
                        project.populate('poster', function (err, project) {
                            res.json(project.poster);
                        });
                    }
                });
            });
        });
    }
};

module.exports.ical_events = function (req, res, next) {
    var icalendar = require('icalendar');

    var query = CalendarEvent.find({'permissions.public': true});
    query = query
        .where({start: {$gte: moment().subtract(1, 'years').startOf('day')}})
        .sort('start')
        .populate('creator', 'username name');
    query.exec(function (err, events) {
        if (err) {
            throw err;
        }

        var ical = new icalendar.iCalendar("2.0");
        ical.addProperty('VERSION', '2.0');
        ical.addProperty("PRODID", "-//Nidarholm//Aktivitetskalender//");
        ical.addProperty("X-WR-CALNAME", "Nidarholmkalenderen");
        ical.addProperty("METHOD", "PUBLISH");
        ical.addProperty("CALSCALE", "GREGORIAN");
        ical.addProperty("X-ORIGINAL", "https://nidarholm.no/events/");
        _.each(events, function (e) {
            var event = new icalendar.VEvent();
            event.addProperty('UID', e.id);
            if (e.modified) {
                event.addProperty('DTSTAMP', e.modified);
            } else {
                event.addProperty('DTSTAMP', e.created);
            }
            event.setSummary(e.title);
            event.setDate(e.start, e.end);
            event.setDescription(e.mdtext.replace(/\r/g, '').replace(/(<([^>]+)>)/ig,""));
            event.setLocation(e.location);
            event.addProperty('URL', 'https://nidarholm.no/events/' + e.id);
            ical.addComponent(event);
        });
        res.setHeader('Filename', 'nidarholm.ics');
        res.setHeader('Content-Disposition', 'attachment; filename=nidarholm.ics');
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Cache-Control', 'max-age=7200, private, must-revalidate');
        res.send(ical.toString());
    });
};

