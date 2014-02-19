var Q = require("q"),
    _ = require('underscore'),
    User = require('../models').User,
    Group = require('../models').Group,
    Organization = require('../models').Organization;

module.exports.memberlist = function (req, res) {
    Organization.findById('nidarholm').populate('instrument_groups.members.user').exec(function (err, org) {
        if (err) {
            throw err;
        }
        res.render('organization/memberlist', {org: org});
    });
};

module.exports.fill_dummy = function (req, res) {
    var user1 = Q.defer(),
        user2 = Q.defer(),
        group1 = Q.defer(),
        org1 = Q.defer();

    return Q.fcall(function() {
        User.findById('user1', function(err, user) {
            if (!user) {
                user = new User();
                user._id = 'user1';
            }
            user.username = 'user1';
            user.name = 'User Number1';
            user.save(function (err) {
                u1 = user;
                user1.resolve(user);
            });
        });
        return user1.promise;
    })
    .then(function(user1){

    User.findById('user2', function(err, user) {
        if (!user) {
            user = new User();
            user._id = 'user2';
        }
        user.username = 'user2';
        user.name = 'User Number2';
        user.save(function (err) {
            var users = [user1, user];
            user2.resolve(users);
        });
    });
    return user2.promise;
    })

    .then(function (users) {
    Group.findById('group1', function (err, group) {
        if (!group) {
            group = new Group();
            group._id = 'group1';
        }
        group.name = 'Group 1';
        group.members = [{user: users[0], role: 'chief'}, {user: users[1]}];
        group.save(function (err) {
            group1.resolve(group);
        });
    });
    return group1.promise;
    })

    .then(function (group1) {
    Organization.findById('nidarholm', function (err, org) {
        if (!org) {
            org = new Organization();
            org._id = 'nidarholm';
        }
        org.instrument_groups = [group1];
        org.member_group = group1;
        org.save(function (err) {
            if (err) {
                org1.reject(err);
            }
            org1.resolve(org);
        });
    });
    return org1.promise;
    })
    .done(function () {
        res.redirect('/organization/memberlist');
    });
};

module.exports.add_user = function (req, res) {
    res.render('organization/add_user');
};

module.exports.add_group = function (req, res) {
    var name = req.body.name,
        organization = req.body.organization;

    Organization.findById(organization, function (err, org) {
        if (err) { throw err; }
        Group.findOneAndUpdate({name: name, organization: org}, {}, {upsert: true}, function (err, group) {
            if (err) { throw err; }
            var has_group = _.find(org.instrument_groups, function (g) {
                if (g._id === group._id) {
                    return group;
                }
            });
            if (has_group) {
                res.json(200, group);
            } else {
                org.instrument_groups.push(group);
                org.save(function (err) {
                    res.json(200, group);
                });
            }
        });
    });
};

module.exports.remove_group = function (req, res, next) {
    var groupid = req.params.groupid,
        organization = req.body.organization;

    Organization.findById(organization, function (err, org) {
        if (err) { next(new Error(err)); }
        org.instrument_groups.pull(groupid);
        org.save(function (err) {
            if (err) { next(new Error(err)); }
            res.json(200);
        });
    });
};

module.exports.users = function (req, res) {
    User.find(function (err, users) {
        res.render('organization/users', {users: users});
    });
};

module.exports.user = function (req, res) {
    User.findOne({username: req.params.id}, function (err, user) {
        if (err) { throw err; }
        Group.find({organization: 'nidarholm'}, function (err, groups) {
            if (err) { throw err; }
            res.render('organization/user', {user: user, groups: groups});
        });
    });
};

module.exports.user_add_group = function (req, res, next) {
    var username = req.params.username,
        groupid = req.body.groupid;

    User.findOne({username: username}, function (err, user) {
        if (err) { throw err; }
        Group.findById(groupid, function (err, group) {
            if (err) { return next(new Error(err)); }
            if (!group) { return next(new Error("Unrecognized group")); }
            user.groups.push(group);
            user.save(function (err) {
                if (err) { throw err; }
                group.members.push({_id: username, user: user});
                group.save(function (err) {
                    res.json(200, group);
                });
            });
        });
    });
};

module.exports.user_remove_group = function (req, res, next) {
    var username = req.params.username,
        groupid = req.params.groupid;

    User.findOne({username: username}, function (err, user) {
        if (err) { next(new Error(err)); }
        user.groups.pull(groupid);
        user.save(function (err) {
            if (err) { next(new Error(err)); }
            Group.findById(groupid, function (err, group) {
                if (err) { next(new Error(err)); }
                var gs = group.members.pull(username);
                group.save(function(err) {
                    if (err) { next(new Error(err)); }
                    res.json(200);
                });
            });
        });
    });
};

