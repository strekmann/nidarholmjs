/*jslint todo: true*/

var express = require('express'),
    router = express.Router(),
    _ = require('underscore'),
    shortid = require('short-mongo-id'),
    ensureAuthenticated = require('../lib/middleware').ensureAuthenticated,
    is_admin = require('../lib/middleware').is_admin,
    User = require('../models').User,
    Group = require('../models').Group,
    Organization = require('../models').Organization;

router.get('/', ensureAuthenticated, function (req, res, next) {
    Organization.findById(req.organization._id)
    .populate('instrument_groups', 'name')
    .exec(function (err, organization) {
        if (err) { throw err; }
        Group.find()
        .select('name')
        .exec(function (err, groups) {
            if (err) { next(err); }
            res.render('organization/groups', {
                groups: groups,
                igroups: organization.instrument_groups,
                meta: {title: 'Grupper'}
            });
        });
    });
});

router.get('/:id', function (req, res, next){
    // TODO: If more organizations, change the user selection
    var groupid = req.params.id;

    User.find().select('username name').lean().exec(function (err, users) {
        if (err) { next(err); }
        Group.findById(groupid)
            .populate('members.user', 'name username')
            .exec(function (err, group) {
                if (err) { next(err); }
                group.members.sort(function (a, b) { return a.user.name.localeCompare(b.user.name); });
                // take away users from dropdown list that does not have a real name
                users = _.filter(users, function (user) {
                    return user.name.replace(/\W/,'').length;
                });
                users.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
                res.render('organization/group', {
                    group: group,
                    users: users,
                    meta: {title: group.name}
                });
        });
    });
});

router.post('/', is_admin, function (req, res, next) {
    // dumb add group
    var name = req.body.name;

    Organization.findById(req.organization._id, function (err, org) {
        if (err) { return next(err); }
        Group
        .findOne({name: name, organization: org})
        .select('name')
        .exec(function (err, group) {
            if (err) { return next(err); }
            if (!group) {
                Group.create({_id: shortid(), name: name, organization: org}, function (err, group) {
                    if (err) { return next(err); }
                    res.json(group);
                });
            }
            else {
                res.json(group);
            }
        });
    });
});

router.post('/:id/users', is_admin, function (req, res, next) {
    var groupid = req.params.id,
        username = req.body.username;

    User.findOne({username: username})
        .select('username name groups')
        .exec(function (err, user) {
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
                        if (err) { throw err; }
                        group.members.push({user: user._id});
                        group.save(function (err) {
                            if (err) { return next(err); }
                            res.json(_.omit(user, 'groups'));
                        });
                    });
                }
            });
    });
});

router.delete('/:groupid/users/:username', is_admin, function (req, res, next) {
    var groupid = req.params.groupid,
        username = req.params.username;

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
