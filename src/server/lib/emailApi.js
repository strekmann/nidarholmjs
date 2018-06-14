/* eslint "no-console": 0 */

import async from 'async';
import config from 'config';

import Group from '../models/Group';
import Role from '../models/Role';
import User from '../models/User';

import { aes } from './crypto';

function translate(string) {
    return string.replace('æ', 'a').replace('ø', 'o').replace('å', 'a').replace(/\s+/, '');
}

export function groupEmailApiRoute(req, res) {
    if (!req.params.groups) {
        res.send(400, 'Nothing to do');
    }
    else {
        let secret = config.sessionSecret;
        secret = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        aes.decrypt(req.params.groups, secret, (err, data) => {
            if (err) {
                console.error(err);
            }
            const parsedData = JSON.parse(data);
            async.map(parsedData.groups, (group, callback) => {
                const listname = parsedData.prefix + translate(group.toLowerCase());
                Group.findOne({ name: group })
                    .populate('members.user', 'email groups in_list on_leave no_email')
                    /*
                     {
                        path: 'members.user',
                        select: 'email',
                        match: {'groups': organization.member_group}
                        }
                    */
                    .exec((err, g) => {
                        if (err) {
                            callback(err);
                        }
                        else {
                            const emails = g.members.reduce((list, member) => {
                                if (
                                    member.user
                                && member.user.email
                                && member.user.in_list
                                && !member.user.no_email
                                && member.user.groups.find((userGroup) => {
                                    return userGroup === req.organization.member_group._id;
                                })) {
                                    list.push(member.user.email);
                                }
                                return list;
                            }, []);
                            const mailinglist = {
                                name: listname,
                                emails,
                            };
                            callback(null, mailinglist);
                        }
                    });
            }, (err, lists) => {
                if (err) {
                    console.error(err);
                }
                const mailinglists = {};
                lists.forEach((list) => {
                    mailinglists[list.name] = list.emails;
                });
                aes.encrypt(JSON.stringify(mailinglists), secret, (err, encryptedData) => {
                    if (err) {
                        console.error(err);
                    }
                    res.send(encryptedData);
                });
            });
        });
    }
}

export function roleEmailApiRoute(req, res) {
    let secret = config.sessionSecret;
    secret = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    const memberPromises = [];
    req.organization.member_group.members.forEach((member) => {
        if (member.roles.length) {
            memberPromises.push(Promise.all([
                User.findById(member.user).exec(),
                Role.find().where('_id').in(member.roles),
            ]).then((results) => {
                const [user, roles] = results;
                const emailRoles = roles.filter((role) => {
                    return role.email;
                });
                return {
                    user,
                    roles: emailRoles,
                };
            }));
        }
    });
    Group
        .find({ organization: 'nidarholm' })
        .where('_id')
        .in(req.organization.instrument_groups)
        .exec()
        .then((groups) => {
            groups.forEach((group) => {
                group.members.forEach((member) => {
                    memberPromises.push(Promise.all([
                        User.findById(member.user).exec(),
                        Role.find().where('_id').in(member.roles),
                    ]).then((results) => {
                        const [user, roles] = results;
                        const emailRoles = roles.filter((role) => {
                            return role.email;
                        });
                        return {
                            user,
                            roles: emailRoles,
                        };
                    }));
                });
            });
            const aliases = {};
            Promise.all(memberPromises).then((results) => {
                results.forEach((result) => {
                    const { user, roles } = result;
                    roles.forEach((role) => {
                        const { email } = role;
                        if (!aliases[email]) {
                            aliases[email] = [];
                        }
                        aliases[email].push(user.email);
                    });
                });
                aes.encrypt(JSON.stringify(aliases), secret, (err, encryptedData) => {
                    if (err) {
                        console.error(err);
                    }
                    res.send(encryptedData);
                });
            });
        });
}
