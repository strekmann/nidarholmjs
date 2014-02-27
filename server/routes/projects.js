var util = require('../lib/util'),
    Project = require('../models/projects').Project,
    Event = require('../models/projects').Event;

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
        tag = req.body.tag,
        private_mdtext = req.body.private_mdtext,
        public_mdtext = req.body.public_mdtext,
        start = req.body.start,
        end = req.body.end;

    var project = new Project();
    project.title = title;
    project.tag = tag;
    project.private_mdtext = private_mdtext;
    project.public_mdtext = public_mdtext;
    project.start = req.body.start;
    project.end = req.body.end;
    project.creator = req.user;

    project.save(function (err) {
        if (err) { return next(err); }
        res.format({
            json: function () {
                res.json(200, project);
            },
            html: function () {
                res.redirect('/projects/' + util.h2b64(project.id));
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
    var id = util.b642h(req.params.id);

    Project.findById(id, function (err, project) {
        if (err) { return next(err); }
        Event.find({tags: project.tag}, function (err, events) {
            project.events = events;
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
};

module.exports.project_create_event = function (req, res, next) {
    var id = req.params.id,
        title = req.body.title,
        location = req.body.location,
        start = req.body.start,
        end = req.body.end;

    Project.findById(id, function (err, project) {
        if (err) { return next(err); }

        var event = new Event();
        event.tags = [project.tag];
        event.title = title;
        event.location = location;
        event.start = start;
        event.end = end;
        event.creator = req.user;

        event.save(function (err) {
            if (err) { return next(err); }
            res.format({
                json: function () {
                    res.json(200, event);
                },
                html: function () {
                    req.flash('success', 'Aktiviteten ble lagret');
                    res.redirect('/projects/' + util.h2b64(project.id));
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
