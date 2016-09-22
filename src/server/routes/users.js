/*jslint unparam: true*/
/*jslint todo: true*/

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    countries = require('country-list/country/cldr/nb/country'),
    multer = require('multer'),
    upload = multer({ storage: multer.diskStorage({}) }).single('file'),
    util = require('../lib/util'),
    upload_file = util.upload_file,
    is_admin = require('../lib/middleware').is_admin,
    is_member = require('../lib/middleware').is_member,
    config = require('config'),
    User = require('../models').User,
    Group = require('../models').Group,
    File = require('../models/files').File;

router.get('/', is_admin, function (req, res) {
    var user_query;
    if (req.query.q) {
        user_query = User.find().regex('name', new RegExp(req.query.q, 'i'));
    } else {
        user_query = User.find();
    }
    user_query.select('username name phone address city instrument joined born')
    .sort('name')
    .exec(function (err, users) {
        res.format({
            html: function () {
                res.render('organization/users', {users: users, meta: {title: 'Alle brukere'}});
            },
            json: function () {
                res.json({users: users});
            }
        });
    });
});

router.get('/:username', is_member, function (req, res) {
    User
    .findOne({username: req.params.username})
    .select('-password -friends')
    .populate({path: 'groups', model: 'Group', select: 'name'})
    .lean()
    .exec(function (err, user) {
        if (err) { throw err; }
        if (!user) {
            res.render('404', {error: "Fant ikke personen"});
        }
        Group.find({organization: 'nidarholm'}, function (err, groups) {
            if (err) { throw err; }
            res.render('organization/user', {user: user, groups: groups, meta: {title: user.name}});
        });
    });
});

router.get('/:username/edit', function (req, res, next) {
    var username = req.params.username;

    User
    .findOne({username: username})
    .select('-password -algorithm -salt -friends')
    .exec(function (err, user) {
        if (err) { next(err); }
        if (req.is_admin || req.user._id === user._id) {
            if (!user.country) {
                user.country = "NO";
            }
            res.render('organization/user_edit.jade', {user: user, countries: countries, meta: {title: user.name}});
        }
        else {
            res.send(403, 'Forbidden');
        }
    });
});

router.post('/:id', function (req, res, next) {
    if (req.params.id === req.user._id || req.is_admin) {
        var id = req.params.id, // this is needed as we can change username
            changes = {};

        changes.username = req.body.username;
        changes.name = req.body.name;
        changes.phone = req.body.phone;
        changes.email = req.body.email;
        changes.instrument = req.body.instrument;
        changes.born = req.body.born;
        changes.address = req.body.address;
        changes.postcode = req.body.postcode;
        changes.city = req.body.city;
        changes.country = req.body.country;

        if (req.body.joined) {
            changes.joined = req.body.joined;
        }
        if (req.body.nmf_id) {
            changes.nmf_id = req.body.nmf_id;
        }
        if (req.body.reskontro) {
            changes.reskontro = req.body.reskontro;
        }
        if (req.body.membership_history) {
            changes.membership_history = req.body.membership_history;
        }
        if (req.is_admin) {
            if (req.body.in_list) {
                changes.in_list = true;
            } else {
                changes.in_list = false;
            }
            if (req.body.on_leave) {
                changes.on_leave = true;
            } else {
                changes.on_leave = false;
            }
            if (req.body.no_email) {
                changes.no_email = true;
            } else {
                changes.no_email = false;
            }
        }
        else { // self edit
            if (req.body.no_email) {
                changes.no_email = true;
            } else {
                changes.no_email = false;
            }
        }

        User.findByIdAndUpdate(id, changes, function (err, user) {
            if (err) { next(err); }
            res.redirect('/users/' + user.username);
        });
    }
    else {
        res.send(403, 'Forbidden');
    }
});

router.get('/:username/pictures', function (req, res) {
    if (req.params.username === req.user.username || req.is_admin) {
        User
        .findOne({username: req.params.username})
        .select('_id')
        .exec(function (err, user) {
            if (err) { throw err; }
            File
            .find({creator: user._id, tags: config.profile_picture_tag})
            .exec(function (err, files) {
                if (err) { throw err; }
                files.reverse();
                res.json(files);
            });
        });
    }
    else {
        res.sendStatus(403);
    }
});

router.post('/:username/pictures', upload, function (req, res) {
    if (req.user.username === req.params.username || req.is_admin) {
        var username = req.params.username,
            filepath = req.file.path,
            filename = req.file.originalname,
            options = {
                tags: [ config.profile_picture_tag]
            };

        User.findOne({username: username}, function (err, user) {
            upload_file(filepath, filename, user, options, function (err, file) {
                if (err) { throw err; }
                user.profile_picture = file._id;
                user.profile_picture_path = file.thumbnail_path;
                user.save(function (err) {
                    if (err) { throw err; }
                    res.json(file);
                });
            });
        });
    }
    else {
        res.sendStatus(403);
    }
});

router.put('/:username/pictures/:id', function (req, res) {
    if (req.user.username === req.params.username || req.is_admin) {
        var username = req.params.username,
            id = req.params.id;

        // TODO: Check that the file is of the users profile pictures
        User.findOne({username: username}, function (err, user) {
            if (err) { throw err; }
            File.findById(id, function (err, file) {
                if (err) { throw err; }
                user.profile_picture = file._id;
                user.profile_picture_path = file.path;
                user.save(function (err) {
                    if (err) { throw err; }
                    res.json(file);
                });
            });
        });
    }
    else {
        res.sendStatus(403);
    }
});

router.post('/:username/groups', is_admin, function (req, res, next) {
    var username = req.params.username,
        groupid = req.body.groupid;

    User.findOne({username: username}, function (err, user) {
        if (err) { return next(err); }
        Group.findById(groupid, function (err, group) {
            if (err) { return next(err); }
            if (!group) { return next(new Error("Unrecognized group")); }
            var already = _.find(user.groups, function (g) {
                return groupid === g.toString();
            });
            if (already) {
                res.sendStatus(404);
            } else {
                user.groups.push(group);
                user.save(function (err) {
                    if (err) { return next(err); }
                    group.members.push({user: user._id});
                    group.save(function (err) {
                        if (err) { return next(err); }
                        res.json(group);
                    });
                });
            }
        });
    });
});

router.delete('/:username/groups/:groupid', is_admin, function (req, res, next) {
    var username = req.params.username,
        groupid = req.params.groupid;

    User.findOne({username: username}, function (err, user) {
        if (err) { next(err); }
        user.groups.pull(groupid);
        user.save(function (err) {
            if (err) { next(err); }
            Group.findById(groupid, function (err, group) {
                if (err) { next(err); }
                _.each(group.members.filter(function (member){
                    return member.user === user._id;
                }), function (member) {
                    group.members.pull(member);
                });
                group.save(function(err) {
                    if (err) { next(err); }
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
        });
    });
});

module.exports = router;