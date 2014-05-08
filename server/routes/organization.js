var Q = require("q"),
    _ = require('underscore'),
    async = require('async'),
    slug = require('slug'),
    mongoose = require('mongoose'),
    shortid = require('short-mongo-id'),
    countries = require('country-list/country/cldr/nb/country'),
    util = require('../lib/util'),
    upload_file = util.upload_file,
    config = require('../settings'),
    User = require('../models').User,
    Group = require('../models').Group,
    Organization = require('../models').Organization,
    File = require('../models/files').File;

module.exports.memberlist = function (req, res) {
    req.organization.populate('instrument_groups', function (err, organization) {
        if (err) { throw err; }
        User.populate(organization.instrument_groups, {
            path: 'members.user',
            select: 'username name phone email instrument'
        }, function (err) {
            if (err) { throw err; }
            res.render('organization/memberlist', {org: organization});
        });
    });
};

module.exports.add_user = function (req, res) {
    Group.find({organization: 'nidarholm'}).exec(function (err, groups) {
        res.render('organization/add_user', {groups: groups});
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
        if (!user.country) {
            user.country = "NO";
        }
        res.render('organization/user_edit.jade', {user: user, countries: countries});
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
        Group.findOne({name: name, organization: org}, function (err, group) {
            if (err) { throw err; }
            if (!group) {
                Group.create({_id: shortid(), name: name, organization: org}, function (err, group) {
                    res.json(200, group);
                });
            }
            else {
                res.json(200, group);
            }
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
    User.findOne({username: req.params.username}).populate({path: 'groups', model: 'Group'}).lean().exec(function (err, user) {
        if (err) { throw err; }
        Group.find({organization: 'nidarholm'}, function (err, groups) {
            if (err) { throw err; }
            res.render('organization/user', {user: user, groups: groups});
        });
    });
};

module.exports.user_pictures = function (req, res, next) {
    User.findOne({username: req.params.username}, function (err, user) {
        if (err) { throw err; }
        File.find({creator: user._id, tags: config.profile_picture_tag}, function (err, files) {
            if (err) { throw err; }
            files.reverse();
            res.json(200, files);
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
            var already = _.find(user.groups, function (g) {
                return groupid === g.toString();
            });
            if (already) {
                res.json(404, {});
            } else {
                user.groups.push(group);
                user.save(function (err) {
                    if (err) { throw err; }
                    group.members.push({user: user._id});
                    group.save(function (err) {
                        res.json(200, group);
                    });
                });
            }
        });
    });
};

module.exports.group_add_user = function (req, res, next) {
    var groupid = req.params.id,
        username = req.body.username;

    User.findOne({username: username}, function (err, user) {
        if (err) { throw err; }
        Group.findById(groupid, function (err, group) {
            if (err) { return next(err); }
            if (!group) { return next(new Error("Unrecognized group")); }
            var already = _.find(user.groups, function (g) {
                return groupid === g.toString();
            });
            if (already) {
                res.json(404, {});
            } else {
                user.groups.push(group);
                user.save(function (err) {
                    if (err) { throw err; }
                    group.members.push({user: user._id});
                    group.save(function (err) {
                        res.json(200, user);
                    });
                });
            }
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
                _.each(group.members.filter(function (member){
                    return member.user === user._id;
                }), function (member) {
                    group.members.pull(member);
                });
                group.save(function(err) {
                    if (err) { next(err); }
                    res.json(200);
                });
            });
        });
    });
};

module.exports.group_remove_user = function (req, res, next) {
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
                    res.json(200);
                });
            });
        });
    });
};

module.exports.groups = function (req, res, next) {
    var name = req.body.name,
        organization_id = 'nidarholm';//req.body.organization;

    Organization.findById(organization_id).populate('instrument_groups').exec(function (err, organization) {
        if (err) { throw err; }
        Group.find(function (err, groups) {
            if (err) { next(err); }
            res.render('organization/groups', {
                groups: groups,
                igroups: organization.instrument_groups
            });
        });
    });
};

module.exports.group = function (req, res, next){
    var groupid = req.params.id;

    User.find().select('username name').lean().exec(function (err, users) {
        if (err) { next(err); }
        Group.findById(groupid)
            .populate('members.user')
            //.select('-members.user.password -members.user.salt') // does not work
            .exec(function (err, group) {
                if (err) { next(err); }
                res.render('organization/group', {group: group, users: users});
        });
    });
};

module.exports.add_instrument_group = function (req, res, next) {
    var groupid = req.body._id;

    Organization.findById('nidarholm', function (err, organization) {
        if (err) { next(err); }
        var already = _.find(organization.instrument_groups, function (g) {
            return groupid === g.toString();
        });
        if (!already) {
            organization.instrument_groups.push(groupid);
            organization.save(function (err) {
                if (err) { next(err); }
                res.json(200, {});
            });
        } else {
            res.json(400, {});
        }
    });
};

module.exports.remove_instrument_group = function (req, res, next) {
    var groupid = req.params.id;

    Organization.findById('nidarholm', function (err, organization) {
        if (err) { next(err); }
        organization.instrument_groups.pull(groupid);
        organization.save(function (err) {
            if (err) { next(err); }
            res.json(200);
        });
    });
};

module.exports.order_instrument_groups = function (req, res, next) {
    var group_order = req.body.group_order;

    Organization.findById('nidarholm', function (err, organization) {
        if (err) { next(err); }

        organization.instrument_groups = group_order;
        organization.save(function (err) {
            if (err) { next(err); }
            res.json(200);
        });
    });
};

module.exports.upload_profile_picture = function (req, res, next) {
    var username = req.params.username;

    User.findOne({username: username}, function (err, user) {
        upload_file(req.files.file.path, req.files.file.originalname, config.files.path_prefix, req.user, null, config.profile_picture_tag, function (err, file) {
            if (err) { throw err; }
            user.profile_picture = file._id;
            user.profile_picture_path = file.path;
            user.save(function (err) {
                if (err) { throw err; }
                res.json(200, file);
            });
        });
    });
};

module.exports.set_profile_picture = function (req, res, next) {
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
                res.json(200, file);
            });
        });
    });
};
