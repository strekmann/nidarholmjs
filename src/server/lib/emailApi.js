import async from 'async';
import config from 'config';
import { aes } from './crypto';
import Group from '../models/Group';

function translate(string) {
    return string.replace('æ', 'a').replace('ø', 'o').replace('å', 'a').replace(/\s+/, '');
}

export default function groupEmailApiRoute(req, res) {
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
            async.map(parsedData.groups, function (group, callback) {
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
                                    member.user.email
                                && member.user.in_list
                                && !member.user.no_email
                                && member.user.groups.find(
                                    userGroup => userGroup === req.organization.member_group._id
                                )) {
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
                lists.forEach(list => {
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
