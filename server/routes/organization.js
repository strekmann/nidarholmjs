var Q = require("q"),
    _ = require('underscore'),
    async = require('async'),
    slug = require('slug'),
    mongoose = require('mongoose'),
    util = require('../lib/util'),
    User = require('../models').User,
    Group = require('../models').Group,
    Organization = require('../models').Organization;

module.exports.memberlist = function (req, res) {
    Organization.findById('nidarholm').exec(function (err, org) {
        if (err) { throw err; }
        // FIXME: If possible, use populate. I have tried my share. I have
        // found no way to populate members, as that should be filled already
        // by mongoose, as these are contained within the document.
        async.map(
            org.instrument_groups,
            function (group, callback) {
                Group.findById(group._id).populate('members.user').exec(function (err, g) {
                    if (err) { throw err; }
                    callback(null, g);
                });
            },
            function (err, results) {
                if (err) { throw err; }
                org.instrument_groups = results;
                res.render('organization/memberlist', {org: org});
            });
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
        res.redirect('/members');
    });
};

module.exports.add_user = function (req, res) {
    Organization.findById('nidarholm').exec(function (err, organization) {
        res.render('organization/add_user', {instrument_groups: organization.instrument_groups});
    });
};

module.exports.create_user = function (req, res, next) {
    Organization.findById('nidarholm').populate('member_group').exec(function (err, organization) {
        if (err) { next(err); }
        if (!organization) {
            next(new Error('Something is very wrong, nidarholm does not exist'));
        }
        User.count().exec(function (err, user_count) {
            var name = req.body.name,
                email = req.body.email,
                instrument = req.body.instrument,
                orgperm = req.body.orgperm,
                groupid = req.body.group;

            var userid = organization.id + '.' + slug(name).toLowerCase() + '.' + user_count;
            var user = new User();
            user._id = userid;
            user.username = userid;
            user.name = name;
            user.email = email;
            user.instrument = instrument;
            var member_group = organization.member_group;
            if (orgperm) {
                if (organization.member_group) {
                    user.groups.push(organization.member_group);
                    member_group.members.push({user: user, role: instrument});
                    member_group.save(function (err) {
                        if (err) { next(err); }
                    });
                }
            }
            if (groupid) {
                Group.findById(groupid, function (err, group) {
                    if (err) { next(err); }
                    if (group) {
                        user.groups.push(group);
                        group.members.push({user: user});
                        group.save(function (err) {
                            if (err) { next(err); }
                            user.save(function (err) {
                                if (err) { next(err); }
                                res.redirect('/members');
                            });
                        });
                    } else {
                        user.save(function (err) {
                            if (err) { next(err); }
                            res.redirect('/members');
                        });
                    }
                });
            } else {
                user.save(function (err) {
                    if (err) { next(err); }
                    res.redirect('/users/' + user.username + '/edit');
                });
            }
        });
    });
};

module.exports.edit_user = function (req, res, next) {
    var username = req.params.username;

    User.findOne({username: username}, function (err, user) {
        if (err) { next(err); }
        res.render('organization/user_edit.jade', {user: user});
    });
};

module.exports.update_user = function (req, res, next) {
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

    User.findByIdAndUpdate(id, changes, function (err, user) {
        if (err) { next(err); }
        res.redirect('/users/' + user.username);
    });
};

module.exports.add_group = function (req, res) {
    // dumb add group

    var name = req.body.name,
        organization = 'nidarholm';//req.body.organization;

    Organization.findById(organization, function (err, org) {
        if (err) { throw err; }
        Group.findOneAndUpdate({name: name, organization: org}, {}, {upsert: true}, function (err, group) {
            if (err) { throw err; }
            res.json(200, group);
        });
    });
};

//module.exports.add_group = function (req, res) {
    //var name = req.body.name,
        //organization = 'nidarholm';//req.body.organization;

    //Organization.findById(organization, function (err, org) {
        //if (err) { throw err; }
        //Group.findOneAndUpdate({name: name, organization: org}, {}, {upsert: true}, function (err, group) {
            //if (err) { throw err; }
            //var has_group = _.find(org.instrument_groups, function (g) {
                //if (g._id === group._id) {
                    //return group;
                //}
            //});
            //if (has_group) {
                //res.json(200, group);
            //} else {
                //org.instrument_groups.push(group);
                //org.save(function (err) {
                    //res.json(200, group);
                //});
            //}
        //});
    //});
//};

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
    User.findOne({username: req.params.username}, function (err, user) {
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
            if (err) { return next(err); }
            if (!group) { return next(new Error("Unrecognized group")); }
            user.groups.push(group);
            user.save(function (err) {
                if (err) { throw err; }
                group.members.push({user: user._id});
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
        if (err) { next(err); }
        user.groups.pull(groupid);
        user.save(function (err) {
            if (err) { next(err); }
            Group.findById(groupid, function (err, group) {
                if (err) { next(err); }
                var gs = group.members.pull(username);
                group.save(function(err) {
                    if (err) { next(err); }
                    res.json(200);
                });
            });
        });
    });
};

module.exports.groups = function (req, res, next) {
    Group.find(function (err, groups) {
        if (err) { next(err); }
        groups = _.map(groups, function (group) {
            var g = group.toJSON();
            g.oid = util.h2b64(group.id);
            return g;
        });
        res.render('organization/groups', {groups: groups});
    });
};

module.exports.group = function (req, res, next){
    var groupid = util.b642h(req.params.id);

    Group.findById(groupid)
        .populate('members.user')
        //.select('-members.user.password -members.user.salt') // does not work
        .exec(function (err, group) {
            if (err) { next(err); }
            res.render('organization/group', {group: group});
    });
};
