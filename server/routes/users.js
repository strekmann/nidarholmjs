var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    countries = require('country-list/country/cldr/nb/country'),
    util = require('../lib/util'),
    upload_file = util.upload_file,
    is_admin = require('../lib/middleware').is_admin,
    config = require('../settings'),
    User = require('../models').User,
    Group = require('../models').Group,
    File = require('../models/files').File;

router.get('/', function (req, res) {
    if (!req.is_admin) {
        res.send(403, 'Forbidden');
    }
    else {
        User
        .find()
        .select('username name')
        .sort('name')
        .exec(function (err, users) {
            res.render('organization/users', {users: users, meta: {title: 'Alle brukere'}});
        });
    }
});

router.get('/:username', function (req, res) {
    if (!req.is_member && req.params.username !== req.user.username) {
        res.send(403, 'Forbidden');
    }
    else {
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
    }
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

        User.findByIdAndUpdate(id, changes, function (err, user) {
            if (err) { next(err); }
            res.redirect('/users/' + user.username);
        });
    }
    else {
        res.send(403, 'Forbidden');
    }
});

router.get('/:username/pictures', function (req, res, next) {
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

router.post('/:username/pictures', function (req, res, next) {
    if (req.user.username === req.params.username || req.is_admin) {
        var username = req.params.username,
            filepath = req.files.file.path,
            filename = req.files.file.originalname,
            user = req.user,
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

router.put('/:username/pictures/:id', function (req, res, next) {
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
        if (err) { throw err; }
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
                    if (err) { throw err; }
                    group.members.push({user: user._id});
                    group.save(function (err) {
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
                    res.sendStatus(200);
                });
            });
        });
    });
});

module.exports = router;
