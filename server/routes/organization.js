var Q = require("q"),
    User = require('../models').User,
    Group = require('../models').Group,
    Organization = require('../models').Organization;

module.exports.memberlist = function (req, res) {
    Organization.findById('nidarholm').populate('instrument_groups.members.user').exec(function (err, org) {
        console.log(JSON.stringify(org, null, "  "));
        var map = {};
        org.members.forEach(function(member) {
            map[member._id] = member;
        });
        console.log(map);
        res.render('organization/memberlist', {org: org, members: map});
    });
}

module.exports.fill_dummy = function (req, res) {
    var u1,
        u2,
        user1 = Q.defer(),
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
            u2 = user;
            user2.resolve(user);
        });
    });
    return user2.promise;
    })

    .then(function (user2) {
    Group.findById('group1', function (err, group) {
        if (!group) {
            group = new Group();
            group._id = 'group1'
        }
        group.name = 'Group 1';
        group.members = [{user: u1, role: 'chief'}, {user: user2}];
        group.save(function (err) {
            group1.resolve(group);
        });
    });
    return group1.promise;
    })

    .then(function (group1) {
    Organization.find().exec(function(err, o) {
        console.log(err, o);
    });
    Organization.findById('nidarholm', function (err, org) {
        console.log("ost");
        console.log(org);
        if (!org) {
            org = new Organization();
            org._id = 'nidarholm';
        }
        org.instrument_groups = [group1];
        org.member_group = group1;
        org.members = [u1, u2];
        org.save(function (err) {
            if (err) {
                console.log(err);
                //org1.reject(err);
            }
            org1.resolve(org);
        });
    });
    return org1.promise;
    })
    .done(res.redirect('/organization/memberlist'));
}
