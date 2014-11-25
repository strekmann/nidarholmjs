var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    shortid = require('short-mongo-id'),
    is_member = require('../lib/middleware').is_member,
    User = require('../models').User,
    Project = require('../models/projects').Project,
    Piece = require('../models/projects').Piece;

router.get('/', is_member, function (req, res, next) {
    var piece_query;
    if (req.query.q) {
        piece_query = Piece.find().regex('title', new RegExp(req.query.q, 'i'));
    } else {
        piece_query = Piece.find();
    }
    piece_query.sort('title').exec(function (err, pieces) {
        res.format({
            html: function () {
                res.render('projects/music', {pieces: pieces, meta: {title: 'Notearkivet'}});
            },
            json: function () {
                res.json({pieces: pieces});
            }
        });
    });
});

router.get('/:id', function (req, res, next) {
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
                else if (_.contains(file.permissions.users, req.user._id)) {
                    return true;
                }
                else {
                    var allowed = false;
                    _.each(req.user.groups, function (group) {
                        var g = group._id;
                        if(_.contains(file.permissions.groups, g)) {
                            allowed = true;
                        }
                    });
                    return allowed;
                }
            });
            //console.log(user_scores);
            res.render('projects/piece', {piece: piece, groups: groups, user_scores: user_scores});
        });
    });
});

router.post('/', function (req, res, next) {
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
                        res.json(music);
                    });
                });
            }
        });
    }
});

router.post('/:id/scores', function (req, res, next) {
    if (!req.is_musicscoreadmin) {
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
                                res.json(file);
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
});

module.exports = router;
