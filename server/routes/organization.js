var _ = require('underscore'),
    async = require('async'),
    slug = require('slug'),
    config = require('../settings'),
    User = require('../models').User,
    Group = require('../models').Group,
    Organization = require('../models').Organization;

module.exports.memberlist = function (req, res) {
    req.organization.populate('instrument_groups', 'name members', function (err, organization) {
        if (err) { throw err; }
        User.populate(organization.instrument_groups, {
            path: 'members.user',
            select: 'username name phone email instrument groups no_email',
            match: {'groups': organization.member_group, 'in_list': true, 'on_leave': false}
            //options: {sort: {name: -1}} // does not work, cuts result set
        }, function (err) {
            if (err) { throw err; }
            _.each(organization.instrument_groups, function (instrument_group) {
                // filter to only show member objects with users, ie the ones we populated
                instrument_group.members = _.filter(instrument_group.members, function (member) {
                    return member.user;
                });
                // sort remaining users by name
                instrument_group.members.sort(function (a, b) {
                    if (!a.user || !b.user) {
                        return 0;
                    }
                    if (a.user.name > b.user.name) {
                        return 1;
                    } if (a.user.name < b.user.name) {
                        return -1;
                    }
                    return 0;
                });
            });
            res.render('organization/memberlist', {org: organization, meta: {title: 'Medlemmer'}});
        });
    });
};

module.exports.add_user = function (req, res, next) {
    if (!req.is_admin) {
        res.send(403, 'Forbidden');
    }
    else {
        Group
        .find({organization: req.organization._id})
        .select('name')
        .exec(function (err, groups) {
            if (err) { return next(err); }
            res.render('organization/add_user', {groups: groups, meta: {title: 'Legg til nytt korpsmedlem'}});
        });
    }
};

module.exports.create_user = function (req, res, next) {
    if (!req.is_admin) {
        res.send(403, 'Forbidden');
    }
    else {
        Organization.findById(req.organization._id).populate('member_group').exec(function (err, organization) {
            if (err) { next(err); }
            if (!organization) {
                next(new Error('Something is very wrong, nidarholm does not exist'));
            }
            User.count().exec(function (err, user_count) {
                if (err) { return next(err); }
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
                if (orgperm && organization.member_group && organization.member_group._id !== groupid) {
                    user.groups.push(organization.member_group);
                    member_group.members.push({user: user, role: instrument});
                    member_group.save(function (err) {
                        if (err) { next(err); }
                    });
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
    }
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
                //res.json(group);
            //} else {
                //org.instrument_groups.push(group);
                //org.save(function (err) {
                    //res.json(group);
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
};

module.exports.add_instrument_group = function (req, res, next) {
    if (req.is_admin) {
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
                    res.format({
                        html: function () {
                            res.sendStatus(200);
                        },
                        json: function () {
                            res.json({});
                        }
                    });
                });
            } else {
                res.sendStatus(400);
            }
        });
    }
    else {
        res.sendStatus(403);
    }
};

module.exports.remove_instrument_group = function (req, res, next) {
    if (req.is_admin) {
        var groupid = req.params.id;

        Organization.findById('nidarholm', function (err, organization) {
            if (err) { next(err); }
            organization.instrument_groups.pull(groupid);
            organization.save(function (err) {
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
    }
    else {
        res.sendStatus(403);
    }
};

module.exports.order_instrument_groups = function (req, res, next) {
    if (req.is_admin) {
        var group_order = req.body.group_order;

        Organization.findById('nidarholm', function (err, organization) {
            if (err) { next(err); }

            organization.instrument_groups = group_order;
            organization.save(function (err) {
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
    }
    else {
        res.sendStatus(403);
    }
};

/*jslint todo: true*/
module.exports.contacts = function (req, res, next) {
    // TODO: Try to merge the two populate calls
    // Does the following actually work?
    req.organization.populate('contact_groups', function (err, organization) {
        if (err) { return next(err); }
        organization.populate({
            path: 'contact_groups.members.user',
            select: 'name username',
            model: 'User'
        },
            function (err, organization) {
                if (err) { return next(err); }
                res.render('organization/contact', {
                    organization: organization,
                    meta: {title: 'Kontakt'}
                });
            });
    });
};

module.exports.edit_organization = function (req, res, next) {
    if (req.is_admin) {
        Group.find({organization: req.organization._id}).select('name').exec(function (err, groups) {
            if (err) { return next(err); }
            res.render('organization/edit_organization', {
                organization: req.organization,
                locales: config.locales,
                groups: groups,
                meta: {title: 'Rediger organisasjon'}
            });
        });
    }
    else {
        res.send(403, 'Forbidden');
    }
};

module.exports.update_organization = function (req, res, next) {
    if (req.is_admin) {
        var name = req.body.name,
            webdomain = req.body.webdomain,
            contact_text = req.body.contact_text,
            visitor_address = req.body.visitor_address,
            mail_address = req.body.mail_address,
            postcode = req.body.postcode,
            city = req.body.city,
            email = req.body.email,
            organization_number = req.body.organization_number,
            public_bank_account = req.body.public_bank_account,
            map_url = req.body.map_url,
            facebook = req.body.facebook,
            twitter = req.body.twitter,
            description = req.body.description,
            tracking_code = req.body.tracking_code;


        var org = req.organization;

        org.name = name;
        org.webdomain = webdomain;
        org.contact_text = contact_text;
        org.visitor_address = visitor_address;
        org.mail_address = mail_address;
        org.postcode = postcode;
        org.city = city;
        org.email = email;
        org.organization_number = organization_number;
        org.public_bank_account = public_bank_account;
        org.map_url = map_url;
        org.social_media.facebook = facebook;
        org.social_media.twitter = twitter;
        org.tracking_code = tracking_code;

        // could probably take what we get, or should we check it?
        _.each(config.languages, function (locale) {
            org.description[locale] = description[locale];
        });

        org.markModified('description');

        org.save(function (err) {
            if (err) { return next(err); }
            res.redirect('/contact');
        });
    }
    else {
        res.send(403, 'Forbidden');
    }
};

module.exports.set_admin_group = function (req, res, next) {
    if (!req.is_admin) {
        res.sendStatus(403);
    } else {
        req.organization.administration_group = req.body.group;
        req.organization.save(function (err) {
            if (err) { return next(err); }
            res.format({
                html: function () {
                    res.sendStatus(200);
                },
                json: function () {
                    res.json({});
                }
            });
        });
    }
};

module.exports.set_musicscoreadmin_group = function (req, res, next) {
    if (!req.is_admin) {
        res.sendStatus(403);
    } else {
        req.organization.musicscoreadmin_group = req.body.group;
        req.organization.save(function (err) {
            if (err) { return next(err); }
            res.format({
                html: function () {
                    res.sendStatus(200);
                },
                json: function () {
                    res.json({});
                }
            });
        });
    }
};

var aes = require('../lib/crypto').aes;

var translate = function (string) {
    return string.replace('æ', 'a').replace('ø', 'o').replace('å', 'a').replace(/\s+/, '');
};

module.exports.encrypted_mailman_lists = function (req, res) {
    if (!req.params.groups) {
        res.send(400, 'Nothing to do');
    }
    else {
        var secret = config.sessionSecret;
        secret = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        var encoded_groups = req.params.groups;
        aes.decrypt(encoded_groups, secret, function (err, data){
            if (err) { console.error(err); }
            data = JSON.parse(data);
            async.map(data.groups, function (group, callback) {
                var listname = data.prefix + translate(group.toLowerCase());
                Group.findOne({name: group})
                    .populate('members.user', 'email groups in_list on_leave no_email')
                        /*{
                        path: 'members.user',
                        select: 'email',
                        match: {'groups': organization.member_group}
                    }*/
                    .exec(function (err, g) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            var emails = _.reduce(g.members, function (list, member) {
                                if (member.user.email && !member.user.no_email && _.find(member.user.groups, function (group) {
                                    return group === req.organization.member_group._id;
                                })) {
                                    list.push(member.user.email);
                                }
                                return list;
                            }, []);
                            var mailinglist = {
                                name: listname,
                                emails : emails
                            };
                            callback(null, mailinglist);
                        }
                    });
            }, function (err, lists) {
                if (err) { console.error(err); }
                var mailinglists = {};
                _.each(lists, function (list) {
                    mailinglists[list.name] = list.emails;
                });
                aes.encrypt(JSON.stringify(mailinglists), secret, function (err, data) {
                    if (err) { console.error(err); }
                    res.send(data);
                });
            });
        });
    }
};
