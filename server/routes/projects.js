var util = require('../lib/util'),
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
        tag = req.body.tag,
        permissions = req.body.permissions,
        private_mdtext = req.body.private_mdtext,
        public_mdtext = req.body.public_mdtext,
        start = req.body.start,
        end = req.body.end;

    var project = new Project();
    project.title = title;
    project.tag = tag;
    project.private_mdtext = private_mdtext;
    project.public_mdtext = public_mdtext;
    project.start = start;
    project.end = end;
    project.permissions = util.set_permissions(permissions);
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
        Event.find({tags: project.tag}).populate('creator', 'username name').exec(function (err, events) {
            project.events = events;
            ForumPost.find({tags: project.tag}).populate('creator', 'username name').exec(function (err, posts) {
                project.posts = posts;
                File.find({tags: project.tag}).populate('creator', 'username name').exec(function (err, files) {
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

// TODO: Temporary page? Add ical format? How to find URL to it?
module.exports.events = function (req, res, next) {
    Event.find({}, function (err, events) {
        if (err) { return next(err); }
        res.format({
            html: function () {
                res.render('projects/events', {events: events});
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
        post.tags.push(project.tag);
        post.save(function (err) {
            if (err) { return next(err); }
            res.redirect('/projects/' + util.h2b64(project.id));
        });
    });
};

module.exports.project_create_file = function (req, res, next) {
    var id = req.params.id;

    Project.findById(id, function (err, project) {
        var prefix = 'uploaded_files';
        fs.readFile(req.files.file.path, function (err, data) {
            var shasum, hex, new_dir, new_symlink, new_file;

            shasum = crypto.createHash('sha1');
            shasum.update('blob ' + data.length +'%s\0');
            shasum.update(data);
            hex = shasum.digest('hex');

            new_dir = path.join(prefix, hex.substr(0,2), hex.substr(2,2), hex);
            if (prefix[0] !== '/') {
                // TODO: Check upon installation / debug that this is writable
                new_dir = path.join(__dirname, '..', '..', new_dir);
            }
            new_file = path.join(new_dir, hex);
            new_symlink = path.join(new_dir, req.files.file.originalname);
            mkdirp(new_dir, function (err) {
                if (err) { throw err; }
                fs.writeFile(new_file, data, function (err) {
                    if (err) { throw err; }
                    fs.unlink(req.files.file.path);
                    fs.symlink(new_file, new_symlink, function (err) {

                        // 47: Already exists
                        if (err && err.errno !== 47) {
                            res.json(500, { error: err });
                        }
                        var file = new File();
                        file.filename = req.files.file.originalname;
                        file.permissions = project.permissions;
                        file.tags.push(project.tag);
                        file.path = new_symlink;
                        file.creator = req.user;
                        file.save(function (err) {
                            if (err) { throw err; }
                            res.json(200, {
                                status: "success"
                            });
                        });
                    });
                });
            });
        });
    });
};
