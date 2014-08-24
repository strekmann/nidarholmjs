var uslug = require('uslug'),
    moment = require('moment'),
    _ = require('underscore'),
    shortid = require('short-mongo-id'),
    util = require('../lib/util'),
    upload_file = util.upload_file,
    config = require('../settings'),
    Project = require('../models/projects').Project,
    Event = require('../models/projects').Event,
    Piece = require('../models/projects').Piece,
    File = require('../models/files').File,
    ForumPost = require('../models/forum').ForumPost;

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
    query.where({end: {$gt: moment().endOf('day')}});
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
                query.where({end: {$lt: moment().endOf('day')}});
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
                res.json(200, projects);
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
            res.json(500, err);
        }
        else {
            res.json(200, projects);
        }
    });
};
*/

module.exports.create_project = function (req, res, next) {
    if (!req.is_member) {
        res.send(403, 'Forbidden');
    }
    else if (!req.body.end) {
        res.json(400, {error: 'Project end time is missing'});
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
                res.json(400, err);
            }
            res.format({
                json: function () {
                    res.json(200, project);
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
                res.json(200, project);
            });
        }
        else {
            res.json(403, 'Forbidden');
        }
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
    query.lean().exec(function (err, project) {
        if (err) { return next(err); }
        if (!project) {
            res.send(404, 'Not found');
        }
        else {
            Event.find({tags: project.tag}).populate('creator', 'username name').sort('start').exec(function (err, events) {
                ForumPost.find({tags: project.tag}).populate('creator', 'username name').sort('-created').exec(function (err, posts) {
                    var images = [];
                    var non_images = [];
                    File.find({tags: project.tag}).populate('creator', 'username name').exec(function (err, files) {
                        res.format({
                            json: function () {
                                res.json(200, project);
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

            var event = new Event();
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
                        res.json(200, event);
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

// TODO: Only hide. Or remove project tag. Or ask.
module.exports.project_delete_event = function (req, res, next) {
    var event_id = req.params.event_id;
    Event.findByIdAndRemove(event_id, function (err, event) {
        if (err) { return next(err); }
        res.json(200, event);
    });
};

module.exports.events = function (req, res, next) {

    // Fetch up to one year at a time in the future
    var y = req.query.y || 0,
        now = moment(),
        startyear,
        endyear,
        start,
        end;

    y = parseInt(y, 10);

    if (now.month() > 6) {
        startyear = now.year() + y;
    } else {
        startyear = now.year() + y + 1;
    }
    endyear = startyear + 1;

    if (!y) {
        start = moment().startOf('day');
    } else {
        start = moment().month(7).date(1).year(startyear).startOf('day');
    }
     end = moment().month(7).date(1).year(endyear).startOf('day');

    var query;
    if (req.user) {
        query = Event.find().or([
            {creator: req.user},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = Event.find({'permissions.public': true});
    }
    query = query
        .where({start: {$gt: start, $lt: end}})
        .sort('start')
        .populate('creator', 'username name');
    query.exec(function (err, events) {
        if (err) {
            throw err;
        }
        res.format({
            html: function () {
                res.render('projects/events', {events: events, meta: {title: "Aktiviteter"}});
            },
            json: function () {
                res.json(200, {events: events});
            }
        });
    });
};

module.exports.event = function (req, res, next) {
    if (req.user) {
        query = Event.findById(req.params.id).or([
            {creator: req.user._id},
            {'permissions.public': true},
            {'permissions.users': req.user._id},
            {'permissions.groups': { $in: req.user.groups }}
        ]);
    }
    else {
        query = Event.findById(req.params.id).where({'permissions.public': true});
    }
    query.exec(function (err, event) {
        if (err) {
            return next(err);
        }
        if (!event) {
            res.send(404, 'Not found');
        }
        else {
            res.format({
                html: function () {
                    res.render('projects/event', {event: event, meta: {title: event.title}});
                }
            });
        }
    });
};

module.exports.update_event = function (req, res, next) {
    Event.findById(req.params.id)
    .or([
        {creator: req.user._id},
        {'permissions.public': true},
        {'permissions.users': req.user._id},
        {'permissions.groups': { $in: req.user.groups }}
    ]).exec(function (err, event) {
        if (err) {
            return next(err);
        }
        if (!event) {
            res.send(400, 'Not found');
        }
        else {
            event.title = req.body.title;
            event.mdtext = req.body.mdtext;
            event.permissions = util.parse_web_permissions(req.body.permissions);
            event.tags = req.body.tags;
            event.start = req.body.start;
            event.end = req.body.end;
            event.location = req.body.location;
            event.save(function (err) {
                if (err) {
                    res.json(400, err);
                }
                else {
                    res.json(200, event);
                }
            });
        }
    });
};

module.exports.project_create_post = function (req, res, next) {
    var id = req.params.id,
        title = req.body.title,
        mdtext = req.body.mdtext;

    Project.findById(id, function (err, project) {
        if (err) {
            res.json(400, err);
        }
        var post = new ForumPost();
        post._id = shortid();
        post.title = title;
        post.mdtext = mdtext;
        post.permissions = project.permissions;
        post.creator = req.user;
        post.tags = [project.tag];
        post.save(function (err) {
            if (err) {
                res.json(400, err);
            }
            else {
                post.populate('creator', 'username name', function (err, post) {
                    if (err) {
                        res.json(400, err);
                    }
                    else {
                        res.format({
                            html: function () {
                                res.redirect('/projects/' + project._id);
                            },
                            json: function () {
                                res.json(200, post);
                            }
                        });
                    }
                });
            }
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
    if (!req.user) {
        res.json(403, "Forbidden");
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
                res.json(200, file);
            });
        });
    }
};

module.exports.piecesearch = function (req, res, next) {
    if (req.is_member) {
        if (req.query.q) {
            Piece.find({title: new RegExp('^'+req.query.q, "i")}).exec(function (err, pieces) {
                res.json(200, {pieces: pieces});
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

module.exports.remove_piece = function (req, res, next) {
    if (!req.is_member) {
        res.json(403, 'Forbidden');
    }
    else {
        Project.findById(req.params.project_id, function (err, project) {
            if (err) { return next(err); }
            project.music.pull(req.body._id);
            project.save(function (err) {
                if (err) { return next(err); }
                res.json(200, {});
            });
        });
    }
};

module.exports.ical_events = function (req, res, next) {
    var icalendar = require('icalendar');

    var query = Event.find({'permissions.public': true});
    query = query
        .where({start: {$gt: moment().subtract('years', 1).startOf('day')}})
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
        ical.addProperty("X-ORIGINAL", "http://nidarholm.no/events/");
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
            event.setDescription(e.mdtext.replace(/\r/g, ''));
            event.setLocation(e.location);
            event.addProperty('URL', 'http://nidarholm.no/events/' + e.id);
            ical.addComponent(event);
        });
        res.setHeader('Filename', 'nidarholm.ics');
        res.setHeader('Content-Disposition', 'attachment; filename=nidarholm.ics');
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Cache-Control', 'max-age=7200, private, must-revalidate');
        res.send(ical.toString());
    });
};

module.exports.piece = function (req, res, next) {
    Piece.findById(req.params.id)
    .populate('scores')
    .exec(function (err, piece) {
        if (err) { return next(err); }
        req.organization.populate('instrument_groups', 'name', function (err, organization) {
            var groups = _.map(organization.instrument_groups, function (group) {
                var g = group.toObject();
                var scores = _.filter(piece.scores, function (score) {
                    return _.contains(score.permissions.groups, group._id);
                });
                g.scores = scores;
                return g;
            });
            //console.log(groups);
            var user_scores = _.filter(piece.scores, function (file) {
                if (file.permissions.public) {
                    return true;
                }
                else if (_.contains(file.permissions.users)) {
                    return true;
                }
                else {
                    var allowed = false;
                    allowed = _.each(file.permissions.groups, function (group) {
                        return _.contains(req.user.groups, group);
                    });
                    return allowed;
                }
            });
            //console.log(user_scores);
            res.render('projects/piece', {piece: piece, groups: groups, user_scores: user_scores});
        });
    });
};

module.exports.create_piece = function (req, res, next) {
    if (!req.is_member) {
        res.send(403, 'Forbidden');
    }
    else {
        var piece = new Piece();
        piece._id = shortid();
        piece.creator = req.user;
        piece.title = req.body.title;
        piece.subtitle = req.body.subtitle;
        piece.composers = req.body.composers ? _.map(req.body.composers.split(","), function (composer) {
            return composer.trim();
        }) : [];
        piece.arrangers = req.body.arrangers ? _.map(req.body.arrangers.split(","), function (arranger) {
            return arranger.trim();
        }) : [];
        piece.save(function (err) {
            if (err) { return next(err); }
            if (req.body.project) {
                Project.findById(req.body.project, function (err, project) {
                    project.music.addToSet({piece: piece._id});
                    project.save(function (err) {
                        if (err) { return next(err); }
                        var music = {
                            piece: piece
                        };
                        res.status(200).json(music);
                    });
                });
            }
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
                    res.status(200).json(music);
                });
            });
        });
    }
};


module.exports.upload_score = function (req, res, next) {
    if (!req.is_admin) {
        res.status(403).send('Forbidden');
    }
    else {
        var options = {
            permissions: {
                'public': false,
                users: [],
                groups: [req.body.group]
            }
        };

        Piece.findById(req.params.id, function (err, piece) {
            if (err) { return next(err); }

            var filename = req.files.file.originalname,
                tmp_path = req.files.file.path;

            util.upload_file(tmp_path, filename, req.user, options, function (err, file) {
                if (err) { return next(err); }

                piece.scores.addToSet(file._id);
                piece.save(function (err) {
                    if (err) { return next(err); }

                    res.format({
                        json: function () {
                            file.populate('creator', 'username name', function (err, file) {
                                if (err) { throw err; }
                                res.json(200, file);
                            });
                        },
                        html: function () {
                            res.redirect("/files");
                        }
                    });
                });
            });

        });
    }
};
