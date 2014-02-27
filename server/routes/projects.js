var Project = require('../models/projects').Project,
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

    project.save(function (err) {
        if (err) { return next(err); }
        res.json(200, project);
    });
};

module.exports.delete_project = function (req, res, next) {
    var id = req.params.id;

    Project.findByIdAndRemove(id, function (err, project) {
        if (err) { return next(err); }
        res.json(200, project);
    });
};
