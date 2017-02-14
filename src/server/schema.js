import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
    // GraphQLInputObjectType,
} from 'graphql';

import GraphQLDate from 'graphql-custom-datetype';

import {
    connectionArgs,
    connectionDefinitions,
    fromGlobalId,
    globalIdField,
    mutationWithClientMutationId,
    nodeDefinitions,
} from 'graphql-relay';

import config from 'config';
import moment from 'moment';
import nodemailer from 'nodemailer';
import uuid from 'node-uuid';

import { connectionFromMongooseQuery, offsetToCursor } from './connections';

import Activity from './models/Activity';
import Event from './models/Event';
import File from './models/File';
import Group from './models/Group';
import Organization from './models/Organization';
import Page from './models/Page';
import PasswordCode from './models/PasswordCode';
import Piece from './models/Piece';
import Project from './models/Project';
import User from './models/User';
import insertFile from './lib/insertFile';
import { buildPermissionObject } from './lib/permissions';

let userType;
let groupType;
let organizationType;
let eventType;
let projectType;
let fileType;
let pageType;
let pieceType;
let groupScoreType;

const { nodeInterface, nodeField } = nodeDefinitions(
    // FIXME: Add permission checks
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            return User.findById(id).exec();
        }
        if (type === 'Group') {
            return Group.findById(id).exec();
        }
        if (type === 'Organization') {
            return Organization.findById(id).exec();
        }
        if (type === 'Piece') {
            return Piece.findById(id).exec();
        }
        if (type === 'Event') {
            return Event.findById(id).exec();
        }
        if (type === 'Project') {
            return Project.findById(id).exec();
        }
        if (type === 'File') {
            return File.findById(id).exec();
        }
        if (type === 'Page') {
            return Page.findById(id).exec();
        }
        if (type === 'Groupscore') {
            return Group.findById(id).exec();
        }
        return null;
    },
    (obj) => {
        if (obj._type === 'User') {
            return userType;
        }
        if (obj._type === 'Group') {
            return groupType;
        }
        if (obj._type === 'Organization') {
            return organizationType;
        }
        if (obj._type === 'Piece') {
            return pieceType;
        }
        if (obj._type === 'Event') {
            return eventType;
        }
        if (obj._type === 'Project') {
            return projectType;
        }
        if (obj._type === 'File') {
            return fileType;
        }
        if (obj._type === 'Page') {
            return pageType;
        }
        return null;
    }
);

function member(organization, user) {
    let organizationMember = { user, role: null };
    if (user) {
        organization.member_group.members.forEach(_m => {
            if (
                (_m.user !== null && typeof _m.user === 'object' && _m.user.id === user.id) ||
                _m.user === user.id
            ) {
                _m.user = user;
                organizationMember = _m;
            }
        });
    }
    return organizationMember;
}

function isMember(organization, user) {
    return !!member(organization, user)._id;
}

function admin(organization, user) {
    let organizationAdmin = null;
    if (user) {
        organization.administration_group.members.forEach(_m => {
            if (
                (_m.user !== null && typeof _m.user === 'object' && _m.user.id === user.id) ||
                _m.user === user.id
            ) {
                _m.user = user;
                organizationAdmin = _m;
            }
        });
    }
    return organizationAdmin;
}

// people having permissions to organization music
function musicscoreadmin(organization, user) {
    if (user) {
        return Group.findById(organization.musicscoreadmin_group).exec().then(
            group => group.members.map(_member => _member.user).includes(user.id)
        );
    }
    return false;
}

function authenticate(query, viewer, options = {}) {
    if (viewer) {
        query.or([
            { creator: viewer.id },
            { 'permissions.public': true },
            { 'permissions.users': viewer.id },
            { 'permissions.groups': { $in: viewer.groups } },
        ]);
    }
    else {
        query.where({ 'permissions.public': true });
        const select = {};
        if (options.exclude) {
            options.exclude.forEach(exclude => { select[exclude] = 0; });
        }
        if (options.include) {
            options.include.forEach(include => { select[include] = 1; });
        }

        query.select(select);
    }
    return query;
}

function sendContactEmail({ name, email, text, organization }) {
    if (config && config.auth && config.auth.smtp && config.auth.smtp.host) {
        const transporter = nodemailer.createTransport(config.auth.smtp);
        const data = {
            from: `${name} <${email}>`,
            to: organization.email,
            subject: `Melding fra ${name} via nidarholm.no`,
            text: text.replace('\n', '\r\n'),
        };
        transporter.sendMail(data, (emailErr, emailInfo) => {
            console.info('EMAIL', emailErr, emailInfo, data);
            if (!emailErr) {
                const receipt = {
                    from: organization.email,
                    to: `${name} <${email}>`,
                    subject: 'Melding sendt',
                    text: 'Takk!\r\n\r\nMeldingen du sendte til styret via nidarholm.no har blitt mottatt.',
                };
                transporter.sendMail(receipt, (receiptErr, receiptInfo) => {
                    console.info('RECEIPT:', receiptErr, receiptInfo, receipt);
                });
            }
        });
    }
    else {
        console.info('EMAIL', name, email, text);
    }
}

userType = new GraphQLObjectType({
    name: 'User',
    description: 'A person',
    fields: () => ({
        id: globalIdField('User'),
        username: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        isActive: {
            type: GraphQLBoolean,
            resolve: user => user.is_active,
        },
        isAdmin: { type: GraphQLBoolean },
        created: { type: GraphQLDate },
        facebookId: {
            type: GraphQLString,
            resolve: user => user.facebook_id,
        },
        googleId: {
            type: GraphQLString,
            resolve: user => user.google_id,
        },
        twitterId: {
            type: GraphQLString,
            resolve: user => user.twitter_id,
        },
        nmfId: {
            type: GraphQLString,
            resolve: user => user.nmf_id,
        },
        phone: { type: GraphQLString },
        address: { type: GraphQLString },
        postcode: { type: GraphQLString },
        city: { type: GraphQLString },
        country: { type: GraphQLString },
        born: { type: GraphQLDate },
        joined: { type: GraphQLDate },
        instrument: { type: GraphQLString },
        instrumentInsurance: {
            type: GraphQLBoolean,
            resolve: user => user.instrument_insurance,
        },
        reskontro: { type: GraphQLString },
        profilePicture: {
            type: GraphQLString,
            resolve: user => user.profile_picture,
        },
        profilePicturePath: {
            type: GraphQLString,
            resolve: user => user.profile_picture_path,
        },
        membershipStatus: {
            type: GraphQLInt,
            resolve: user => user.membership_status,
        },
        membershipHistory: {
            type: GraphQLString,
            resolve: user => user.membership_history,
        },
        inList: {
            type: GraphQLBoolean,
            resolve: user => user.in_list,
        },
        onLeave: {
            type: GraphQLBoolean,
            resolve: user => user.on_leave,
        },
        noEmail: {
            type: GraphQLBoolean,
            resolve: user => user.no_email,
        },
        groups: {
            type: new GraphQLList(groupType),
            resolve: user => Group.find({ 'members.user': user._id }).exec(),
        },
    }),
    interfaces: [nodeInterface],
});

/*
const userConnection = connectionDefinitions({
    name: 'User',
    nodeType: userType,
});
*/

groupType = new GraphQLObjectType({
    name: 'Group',
    fields: {
        id: globalIdField('Group'),
        name: { type: GraphQLString },
        externallyHidden: {
            type: GraphQLBoolean,
            resolve: group => group.externally_hidden,
        },
        members: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'GroupMember',
                fields: {
                    id: { type: GraphQLString },
                    user: {
                        type: userType,
                        resolve: (groupMember, args, { viewer, organization }) => {
                            let query = User.findById(groupMember.user).where({
                                on_leave: false,
                                in_list: true,
                                //membership_status: { $lt: 5 },
                            });
                            if (isMember(organization, viewer)) {
                                query = query.select('id name email phone');
                            }
                            else {
                                query = query.select('name');
                            }
                            return query.exec();
                        },
                    },
                    role: { type: new GraphQLObjectType({
                        name: 'GroupRole',
                        fields: {
                            title: { type: GraphQLString },
                            email: { type: GraphQLString },
                        },
                    }) },
                },
            })),
            resolve: (group, args, { organization }) => {
                const members = organization.member_group.members.map(
                    (organizationMember) => {
                        if (typeof organizationMember.user === 'object') {
                            // "self" is acutally an object. strange populate?
                            return organizationMember.user._id;
                        }
                        return organizationMember.user;
                    },
                );
                const active = group.members.filter((groupMember) => {
                    if (members.includes(groupMember.user)) {
                        return true;
                    }
                    return false;
                });
                return active;
            },
        },
    },
    interfaces: [nodeInterface],
});

/*
const groupConnection = connectionDefinitions({
    name: 'Group',
    nodeType: groupType,
});
*/

const permissionsType = new GraphQLObjectType({
    name: 'Permissions',
    fields: () => ({
        public: { type: new GraphQLNonNull(GraphQLBoolean) },
        groups: {
            type: new GraphQLList(groupType),
            resolve: permission => permission.groups.map(groupId => Group.findById(groupId).exec()),
        },
        users: {
            type: new GraphQLList(userType),
            resolve: permission => permission.users.map(userId => User.findById(userId).exec()),
        },
    }),
});

fileType = new GraphQLObjectType({
    name: 'File',
    fields: {
        id: globalIdField('File'),
        filename: { type: GraphQLString },
        created: { type: GraphQLDate },
        creator: { type: GraphQLString },
        mimetype: { type: GraphQLString },
        size: { type: GraphQLInt },
        tags: { type: new GraphQLList(GraphQLString) },
        path: { type: GraphQLString },
        thumbnailPath: {
            type: GraphQLString,
            resolve: file => file.thumbnail_path,
        },
        normalPath: {
            type: GraphQLString,
            resolve: file => file.normal_path,
        },
        largePath: {
            type: GraphQLString,
            resolve: file => file.large_path,
        },
        isImage: {
            type: GraphQLBoolean,
            resolve: file => file.is_image,
        },
        permissions: { type: permissionsType },
    },
    interfaces: [nodeInterface],
});

const fileConnection = connectionDefinitions({
    name: 'File',
    nodeType: fileType,
});

/*
const scoreConnection = connectionDefinitions({
    name: 'Score',
    nodeType: fileType,
});
*/

eventType = new GraphQLObjectType({
    name: 'Event',
    fields: {
        id: globalIdField('Event'),
        title: { type: GraphQLString },
        location: { type: GraphQLString },
        start: { type: GraphQLDate },
        end: { type: GraphQLDate },
        tags: { type: new GraphQLList(GraphQLString) },
        mdtext: { type: GraphQLString },
        permissions: { type: permissionsType },
        isEnded: {
            type: GraphQLBoolean,
            resolve: (event) => {
                // if start or end of event is before start of today, it is no longer
                // interesting
                if (!event.start) {
                    return false;
                }
                if (event.end) {
                    if (moment(event.end) < moment().startOf('day')) {
                        return true;
                    }
                }
                if (moment(event.start) < moment().startOf('day')) {
                    return true;
                }
                return false;
            },
        },
    },
    interfaces: [nodeInterface],
});
const eventConnection = connectionDefinitions({
    name: 'Event',
    nodeType: eventType,
});

groupScoreType = new GraphQLObjectType({
    name: 'Groupscore',
    fields: () => ({
        id: globalIdField('Groupscore'),
        name: {
            type: GraphQLString,
            resolve: (group) => group.name,
        },
        files: {
            type: fileConnection.connectionType,
            resolve: (group, args) => connectionFromMongooseQuery(
                File.find({ 'permissions.groups': group.id }).where('_id').in(group.scores),
                args,
            ),
        },
    }),
    interfaces: [nodeInterface],
});

pieceType = new GraphQLObjectType({
    name: 'Piece',
    fields: () => ({
        id: globalIdField('Piece'),
        title: { type: GraphQLString },
        subtitle: { type: GraphQLString },
        description: { type: GraphQLString },
        description_composer: { type: GraphQLString },
        description_arranger: { type: GraphQLString },
        description_publisher: { type: GraphQLString },
        composers: { type: new GraphQLList(GraphQLString) },
        arrangers: { type: new GraphQLList(GraphQLString) },
        files: {
            type: fileConnection.connectionType,
            resolve: (piece, args, { viewer }) => connectionFromMongooseQuery(
                authenticate(File.find().where('_id').in(piece.scores), viewer),
                args,
            ),
            /*
            resolve: (piece, args, { viewer }) => {
                const scores = piece.scores
                .map(score => authenticate(File.findById(score), viewer));
                return Promise.all(scores).then(_scores => _scores.filter(file => file !== null));
            },
            */
        },
        groupscores: {
            type: new GraphQLList(groupScoreType),
            resolve: (piece, args, { organization, viewer }) => {
                if (!musicscoreadmin(organization, viewer)) {
                    throw new Error('Nobody');
                }
                return organization.instrument_groups
                .map(groupId => Group.findById(groupId)
                     .exec()
                     .then(_group => {
                         const group = _group.toObject();
                         group.scores = piece.scores;
                         return group;
                     }));
            },
        },
        scoreCount: {
            type: GraphQLInt,
            resolve: (piece => piece.scores.length),
        },
        unique_number: { type: GraphQLInt },
        record_number: { type: GraphQLInt },
        archive_number: { type: GraphQLInt },
        band_setup: { type: GraphQLString },
        short_genre: { type: GraphQLString },
        genre: { type: GraphQLString },
        published: { type: GraphQLString },
        acquired: { type: GraphQLString },
        concerts: { type: GraphQLString },
        maintenance_status: { type: GraphQLString },
        nationality: { type: GraphQLString },
        difficulty: { type: GraphQLInt },
        publisher: { type: GraphQLString },
        import_id: { type: GraphQLInt },
        created: { type: GraphQLDate },
        creator: { type: userType },
    }),
    interfaces: [nodeInterface],
});

const pieceConnection = connectionDefinitions({
    name: 'Piece',
    nodeType: pieceType,
});

projectType = new GraphQLObjectType({
    name: 'Project',
    fields: {
        id: globalIdField('Project'),
        title: { type: GraphQLString },
        tag: { type: GraphQLString },
        start: { type: GraphQLDate },
        end: { type: GraphQLDate },
        year: { type: GraphQLString },
        publicMdtext: {
            type: GraphQLString,
            resolve: project => project.public_mdtext,
        },
        privateMdtext: {
            type: GraphQLString,
            resolve: (project, args, { viewer, organization }) => {
                if (isMember(organization, viewer)) {
                    return project.private_mdtext;
                }
                return null;
            },
        },
        conductors: { type: new GraphQLList(userType) },
        poster: {
            type: fileType,
            resolve: (a) => File.findById(a.poster).exec(),
        },
        events: {
            type: eventConnection.connectionType,
            args: connectionArgs,
            resolve: (project, args, { viewer }) => connectionFromMongooseQuery(
                authenticate(Event.find({ tags: project.tag }).sort('start'), viewer),
                args,
            ),
        },
        files: {
            type: fileConnection.connectionType,
            args: connectionArgs,
            resolve: (project, args, { viewer }) => connectionFromMongooseQuery(
                authenticate(File.find({ tags: project.tag }), viewer).sort({ created: -1 }),
                args,
            ),
        },
        music: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'Music',
                fields: {
                    id: { type: GraphQLString },
                    piece: {
                        type: pieceType,
                        resolve: (music) => Piece.findById(music.piece).exec(),
                    },
                    parts: { type: GraphQLString },
                },
            })),
        },
        permissions: {
            type: permissionsType,
        },
    },
    interfaces: [nodeInterface],
});

const projectConnection = connectionDefinitions({
    name: 'Project',
    nodeType: projectType,
});

pageType = new GraphQLObjectType({
    name: 'Page',
    description: 'Wiki page',
    fields: {
        id: globalIdField('Page'),
        slug: { type: GraphQLString },
        title: { type: GraphQLString },
        summary: { type: GraphQLString },
        mdtext: { type: GraphQLString },
        created: { type: GraphQLDate },
        creator: {
            type: userType,
            resolve: (page) => User.findById(page.creator).exec(),
        },
        updated: { type: GraphQLDate },
        updator: {
            type: userType,
            resolve: (page) => User.findById(page.updator).exec(),
        },
        permissions: {
            type: permissionsType,
        },
    },
    interfaces: [nodeInterface],
});

const pageConnection = connectionDefinitions({
    name: 'Page',
    nodeType: pageType,
});

organizationType = new GraphQLObjectType({
    name: 'Organization',
    description: 'Organization and site info',
    fields: {
        id: globalIdField('Organization'),
        name: { type: GraphQLString },
        webdomain: { type: GraphQLString },
        mailAddress: {
            type: GraphQLString,
            resolve: organization => organization.mail_address,
        },
        postcode: { type: GraphQLString },
        city: { type: GraphQLString },
        email: { type: GraphQLString },
        publicBankAccount: {
            type: GraphQLString,
            resolve: organization => organization.public_bank_account,
        },
        organizationNumber: {
            type: GraphQLString,
            resolve: organization => organization.organization_number,
        },
        encodedEmail: {
            type: GraphQLString,
            resolve: organization => organization.encoded_email,
        },
        website: { type: GraphQLString },
        twitter: { type: GraphQLString },
        facebook: { type: GraphQLString },
        instagram: { type: GraphQLString },
        description_nb: { type: GraphQLString }, // TODO: Migrate
        mapUrl: {
            type: GraphQLString,
            resolve: organization => organization.map_url,
        },
        facebookAppid: {
            type: GraphQLString,
            resolve: () => config.auth.facebook.clientId,
        },
        baseurl: {
            type: GraphQLString,
            resolve: () => `${config.site.protocol}://${config.site.domain}`,
        },
        contactText: {
            type: GraphQLString,
            resolve: organization => organization.contact_text,
        },
        memberGroup: {
            type: groupType,
            resolve: organization => organization.member_group,
        },
        musicscoreAdmins: {
            type: new GraphQLList(GraphQLString),
            resolve: organization => organization.musicscore_admins,
        },
        isMember: {
            type: GraphQLBoolean,
            resolve: (_, args, { organization, viewer }) => isMember(organization, viewer),
        },
        isAdmin: {
            type: GraphQLBoolean,
            resolve: (_, args, { organization, viewer }) => admin(organization, viewer),
        },
        isMusicscoreadmin: {
            type: GraphQLBoolean,
            resolve: (_, args, { organization, viewer }) => musicscoreadmin(organization, viewer),
        },
        instrumentGroups: {
            type: new GraphQLList(groupType),
            resolve: (_, args, { organization }) => Organization
            .findById(organization.id)
            .populate({
                path: 'instrument_groups',
                match: { externally_hidden: { $ne: true } },
            })
            .exec()
            .then(
                _organization => _organization.instrument_groups
            ),
        },
        users: {
            type: new GraphQLList(userType),
            resolve: (_, args, { organization, viewer }) => {
                let query;
                if (admin(organization, viewer)) {
                    query = User.find().select('name username');
                }
                else {
                    query = User.find({ _id: { $exists: false } });
                }
                return query.sort('-created').exec();
            },
        },
        project: {
            type: projectType,
            args: {
                year: { name: 'year', type: GraphQLString },
                tag: { name: 'tag', type: GraphQLString },
            },
            resolve: (_, args) => Project.findOne({ tag: args.tag, year: args.year }).exec(),
        },
        nextProject: {
            type: projectType,
            resolve: (_, args, { viewer, organization }) => {
                let query = Project.findOne({
                    end: { $gte: moment().startOf('day').toDate() },
                });
                if (!isMember(organization, viewer)) {
                    query = query.where({ public_mdtext: { $ne: '' } });
                }
                return authenticate(
                    query.sort({ end: 1 }),
                    viewer,
                    { exclude: ['private_mdtext'] },
                );
            },
        },
        nextProjects: {
            type: connectionDefinitions({
                name: 'UpcomingProject',
                nodeType: projectType,
            }).connectionType,
            args: connectionArgs,
            resolve: (_, args, { viewer, organization }) => {
                let query = Project.find({
                    end: { $gte: moment().startOf('day').toDate() },
                });
                if (!isMember(organization, viewer)) {
                    query = query.where({ public_mdtext: { $ne: '' } });
                }
                return connectionFromMongooseQuery(
                    query.sort({ end: 1 }),
                    args,
                );
            },
        },
        previousProjects: {
            type: projectConnection.connectionType,
            args: connectionArgs,
            resolve: (_, { ...args }) => connectionFromMongooseQuery(
                Project.find({
                    end: { $lt: moment().startOf('day').toDate() },
                }).sort({ end: -1 }),
                args,
            ),
        },
        event: {
            type: eventType,
            args: {
                eventid: { name: 'eventid', type: GraphQLID },
            },
            resolve: (_, { eventid }, { viewer }) => {
                const id = fromGlobalId(eventid).id;
                const query = Event.findById(id);
                return authenticate(query, viewer, { exclude: ['mdtext'] });
            },
        },
        events: {
            type: eventConnection.connectionType,
            args: connectionArgs,
            resolve: (parent, { ...args }, { viewer }) => {
                const query = Event
                .find({
                    start: {
                        $gte: moment().startOf('day').toDate(),
                    },
                })
                .sort({ start: 1 });
                return connectionFromMongooseQuery(
                    authenticate(query, viewer, { exclude: ['mdtext'] }),
                    args,
                );
            },
        },
        nextEvents: {
            type: eventConnection.connectionType,
            args: connectionArgs,
            resolve: (parent, { ...args }, { viewer }) => {
                const query = Event
                .find({
                    start: {
                        $gte: moment().startOf('day').toDate(),
                        $lt: moment().add(2, 'months').startOf('day').toDate(),
                    },
                })
                .sort({ start: 1 });
                return connectionFromMongooseQuery(
                    authenticate(query, viewer, { exclude: ['mdtext'] }),
                    args,
                );
            },
        },
        pages: {
            type: pageConnection.connectionType,
            args: connectionArgs,
            resolve: (_, { ...args }, { viewer }) => connectionFromMongooseQuery(
                authenticate(Page.find().sort({ created: -1 }), viewer),
                args,
            ),
        },
        page: {
            type: pageType,
            args: {
                slug: { name: 'slug', type: GraphQLString },
            },
            resolve: (_, { slug }, { viewer }) => {
                const query = Page.findOne({ slug });
                return authenticate(query, viewer);
            },
        },
        summaries: {
            type: new GraphQLList(pageType),
            resolve: (organization) => Organization
            .findById(organization.id)
            .populate({ path: 'summaries', select: 'summary title slug' })
            .exec()
            .then(org => org.summaries),
        },
        member: {
            type: new GraphQLObjectType({
                name: 'Member',
                fields: {
                    id: { type: GraphQLString },
                    user: {
                        type: userType,
                        resolve: (_member) => _member.user,
                    },
                    role: { type: new GraphQLObjectType({
                        name: 'Role',
                        fields: {
                            title: { type: GraphQLString },
                            email: { type: GraphQLString },
                        },
                    }) },
                },
            }),
            args: {
                id: { name: 'id', type: GraphQLString },
            },
            resolve: (_, { id }, { organization, viewer }) => {
                const userId = fromGlobalId(id).id;
                if (!isMember(organization, viewer) && !viewer.id === userId) {
                    throw new Error('Nobody');
                }
                let query = User.findById(userId);
                if (admin(organization, viewer)) {
                    query = query.select('+facebook_id +twitter_id +google_id +nmf_id');
                    query = query.select('+instrument_insurance +reskontro +membership_history');
                }
                return query.exec().then(user => member(organization, user));
            },
        },
        files: {
            type: fileConnection.connectionType,
            args: {
                tags: { type: GraphQLString },
                term: { type: GraphQLString },
                ...connectionArgs,
            },
            resolve: (_, args, { viewer }) => {
                const tags = args.tags.split('|');
                let query = File.find().sort('-created');
                if (args.tags.length) {
                    query = query.where({ tags: { '$all': tags } });
                }
                return connectionFromMongooseQuery(
                    authenticate(query, viewer),
                    args,
                );
            },
        },
        piece: {
            type: pieceType,
            args: {
                pieceId: { name: 'pieceId', type: GraphQLString },
            },
            resolve: (_, { pieceId }, { viewer, organization }) => {
                if (!member(organization, viewer)) {
                    throw new Error('Nobody');
                }
                const id = fromGlobalId(pieceId).id;
                return Piece.findById(id).exec();
            },
        },
        pieces: {
            type: pieceConnection.connectionType,
            args: {
                term: { type: GraphQLString },
                ...connectionArgs,
            },
            resolve: (_, args, { viewer, organization }) => {
                let query;
                if (!args.term) {
                    query = Piece.find();
                }
                else {
                    query = Piece.find().regex('title', new RegExp(args.term, 'i'));
                }
                return connectionFromMongooseQuery(
                    query.sort({ title: 1 }),
                    args,
                );
            },
        },
        tags: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'Tag',
                fields: {
                    tag: { type: GraphQLString },
                    count: { type: GraphQLInt },
                },
            })),
            args: {
                tags: { type: GraphQLString },
                term: { type: GraphQLString },
            },
            resolve: (_, args, { organization, viewer }) => {
                const tags = args.tags.split('|');
                return File.aggregate(
                    { $match: { tags: { $all: tags } } },
                    { $project: { tags: 1 } },
                    { $unwind: '$tags' },
                    { $match: { tags: { $nin: tags, $regex: `^${args.term}` } } },
                    { $group: { _id: '$tags', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 20 },
                    { $project: { _id: 1, count: 1 } },
                )
                    .then(aggregatedTags => {
                        return aggregatedTags.map(tag => {
                            return { tag: tag._id, count: tag.count };
                        });
                    });
            },
        },
        group: {
            type: groupType,
            args: {
                groupId: { type: GraphQLID },
            },
            resolve: (_, { groupId }, { viewer, organization }) => {
                const gId = fromGlobalId(groupId).id;
                const query = Group.findById(gId);
                if (!isMember(organization, viewer)) {
                    throw new Error('Noboby');
                }
                return query.exec();
            },
        },
        groups: {
            type: new GraphQLList(groupType),
            resolve: (_, args, { organization, viewer }) => {
                if (!admin(organization, viewer)) {
                    throw new Error('Nobody');
                }
                return Group.find().sort('name');
            },
        },
    },
    interfaces: [nodeInterface],
});

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        viewer: {
            type: userType,
            resolve: ({ viewer }) => viewer,
        },
        organization: {
            type: organizationType,
        },
    },
});

const mutationEditDescription = mutationWithClientMutationId({
    name: 'EditDescription',
    inputFields: {
        orgid: { type: new GraphQLNonNull(GraphQLID) },
        description_nb: { type: GraphQLString },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ orgid, description_nb }) => {
        const id = fromGlobalId(orgid).id;
        return Organization.findByIdAndUpdate(
            id, {
                description_nb,
            }, {
                new: true,
            },
        ).exec();
    },
});

const mutationAddEvent = mutationWithClientMutationId({
    name: 'AddEvent',
    inputFields: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: GraphQLString },
        start: { type: GraphQLString },
        end: { type: GraphQLString },
        tags: { type: new GraphQLList(GraphQLString) },
        mdtext: { type: GraphQLString },
        permissions: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newEventEdge: {
            type: eventConnection.edgeType,
            resolve: payload => ({
                cursor: offsetToCursor(0),
                node: payload,
            }),
        },
    },
    mutateAndGetPayload: (
        { title, location, start, end, tags, mdtext, permissions },
        { viewer },
    ) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const permissionObj = buildPermissionObject(permissions);
        const event = new Event();
        event.creator = viewer.id;
        event.title = title;
        event.location = location;
        event.start = moment.utc(start);
        if (event.end) {
            event.end = moment.utc(end);
        }
        event.tags = tags;
        event.mdtext = mdtext;
        event.permissions = permissionObj;
        // TODO: Check permissions
        return event.save();
    },
});

const mutationSaveFilePermissions = mutationWithClientMutationId({
    name: 'SaveFilePermissions',
    inputFields: {
        fileId: { type: new GraphQLNonNull(GraphQLID) },
        permissions: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        file: {
            type: fileType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ fileId, permissions }, { viewer }) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const id = fromGlobalId(fileId).id;
        const permissionObj = buildPermissionObject(permissions);
        const query = File.findByIdAndUpdate(
            id,
            { permissions: permissionObj },
            { new: true }
        );
        return authenticate(query, viewer).exec().then(file => {
            if (!file) {
                throw new Error('Nothing!');
            }
            Activity.findOneAndUpdate({ content_ids: id }, { permissions: permissionObj }).exec();
            return file;
        });
    },
});

const mutationSetProjectPoster = mutationWithClientMutationId({
    name: 'SetProjectPoster',
    inputFields: {
        projectId: { type: new GraphQLNonNull(GraphQLID) },
        fileId: { type: new GraphQLNonNull(GraphQLID) },
    },
    outputFields: {
        project: {
            type: projectType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ projectId, fileId }, { viewer }) => {
        const id = fromGlobalId(projectId).id;
        const posterId = fromGlobalId(fileId).id;
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const query = Project.findByIdAndUpdate(
            id,
            { poster: posterId },
            { new: true },
        );
        return authenticate(query, viewer).exec().then(project => {
            if (!project) {
                throw new Error('Nothing!');
            }
            return project;
        });
    },
});

const mutationEditEvent = mutationWithClientMutationId({
    name: 'EditEvent',
    inputFields: {
        eventid: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        location: { type: GraphQLString },
        start: { type: new GraphQLNonNull(GraphQLString) }, // Would prefer date object
        end: { type: GraphQLString },
        mdtext: { type: GraphQLString },
    },
    outputFields: {
        event: {
            type: eventType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ eventid, title, location, start, end, mdtext }, { viewer }) => {
        const id = fromGlobalId(eventid).id;
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const query = Event.findByIdAndUpdate(
            id,
            { title, location, start, end, mdtext },
            { new: true },
        );
        return authenticate(query, viewer).exec().then(event => {
            if (!event) {
                throw new Error('Nothing!');
            }
            return event;
        });
    },
});

const mutationAddPage = mutationWithClientMutationId({
    name: 'AddPage',
    inputFields: {
        slug: { type: new GraphQLNonNull(GraphQLString) },
        mdtext: { type: GraphQLString },
        title: { type: GraphQLString },
        summary: { type: GraphQLString },
        permissions: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newPageEdge: {
            type: pageConnection.edgeType,
            resolve: payload => ({
                cursor: offsetToCursor(0),
                node: payload,
            }),
        },
    },
    mutateAndGetPayload: ({ slug, mdtext, title, summary, permissions }, { viewer }) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const userId = viewer.id;
        const permissionObj = buildPermissionObject(permissions);
        const page = new Page();
        page._id = uuid.v4();
        page.slug = slug;
        page.mdtext = mdtext;
        page.title = title;
        page.summary = summary;
        page.permissions = permissionObj;
        page.creator = userId;
        // TODO: Check permissions
        return page.save();
    },
});

const mutationAddUser = mutationWithClientMutationId({
    name: 'AddUser',
    inputFields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        instrument: { type: GraphQLString },
        isMember: { type: GraphQLBoolean },
        groupId: { type: GraphQLID },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newUser: {
            type: userType,
            resolve: payload => payload,
        },
    },
    mutateAndGetPayload: (
        { name, email, instrument, isMember, groupId },
        { viewer, organization },
    ) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        return Organization
        .findById(organization.id)
        .populate('member_group')
        .exec()
        .then(_organization => {
            const userId = uuid.v4();
            const user = new User({ _id: userId, username: userId, instrument, name });
            let p = Promise.resolve(_organization);
            if (isMember) {
                user.groups.push(_organization.member_group);
                _organization.member_group.members.push({ user, role: instrument });
                p = _organization.member_group.save();
            }
            return p.then(_org => {
                if (groupId) {
                    const gId = fromGlobalId(groupId).id;
                    return Group.findById(gId).exec().then(group => {
                        user.groups.push(group);
                        group.members.push({ user });
                        return group.save();
                    });
                }
                return Promise.resolve(_org);
            }).then(() => user.save());
        });
    },
});

const mutationEditUser = mutationWithClientMutationId({
    name: 'EditUser',
    inputFields: {
        userId: { type: GraphQLID },
        username: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        instrument: { type: GraphQLString },
        born: { type: GraphQLString },
        address: { type: GraphQLString },
        postcode: { type: GraphQLString },
        city: { type: GraphQLString },
        country: { type: GraphQLString },
        joined: { type: GraphQLString },
        nmfId: { type: GraphQLString },
        reskontro: { type: GraphQLString },
        membershipHistory: { type: GraphQLString },
        inList: { type: GraphQLBoolean },
        onLeave: { type: GraphQLBoolean },
        noEmail: { type: GraphQLBoolean },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
    },
    mutateAndGetPayload: ({
        userId, username, name, phone, email, instrument, born, address,
        postcode, city, country, joined, nmfId, reskontro, membershipHistory,
        inList, onLeave, noEmail,
    }, { viewer, organization }) => {
        const id = fromGlobalId(userId).id;
        const fields = {};
        if (admin(organization, viewer)) {
            Object.assign(fields, {
                name,
                phone,
                email,
                instrument,
                born,
                address,
                postcode,
                city,
                country,
                joined,
                nmf_id: nmfId,
                reskontro,
                membership_history: membershipHistory,
                in_list: inList,
                on_leave: onLeave,
                no_email: noEmail,
            });
        }
        if (viewer.id === id) {
            Object.assign(fields, {
                username,
                name,
                phone,
                email,
                instrument,
                born,
                address,
                postcode,
                city,
                country,
            });
        }
        return User.findByIdAndUpdate(id, fields, { new: true }).exec();
    },
});

const mutationEditPage = mutationWithClientMutationId({
    name: 'EditPage',
    inputFields: {
        pageid: { type: new GraphQLNonNull(GraphQLID) },
        slug: { type: new GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLString },
        summary: { type: GraphQLString },
        mdtext: { type: GraphQLString },
        permissions: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        page: {
            type: pageType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ pageid, slug, mdtext, title, summary, permissions }, { viewer }) => {
        const id = fromGlobalId(pageid).id;
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const permissionObj = buildPermissionObject(permissions);
        const query = Page.findByIdAndUpdate(
            id,
            {
                slug,
                mdtext,
                summary,
                title,
                permissions: permissionObj,
                updator: viewer.id,
                updated: moment.utc(),
            },
            { new: true },
        );
        return authenticate(query, viewer).exec().then(page => {
            if (!page) {
                throw new Error('Nothing!');
            }
            return page;
        });
    },
});

const mutationSaveOrganization = mutationWithClientMutationId({
    name: 'SaveOrganization',
    inputFields: {
        summaryIds: { type: new GraphQLList(GraphQLID) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: payload => payload,
        },
    },
    mutateAndGetPayload: ({ summaryIds }, { viewer, organization }) => {
        const pageIds = summaryIds.map(pageId => fromGlobalId(pageId).id);
        return Organization.findByIdAndUpdate(
            organization.id,
            { summaries: pageIds },
            { new: true },
        );
    },
});

const mutationAddFile = mutationWithClientMutationId({
    name: 'AddFile',
    inputFields: {
        filename: {
            type: new GraphQLNonNull(GraphQLString),
        },
        hex: {
            type: new GraphQLNonNull(GraphQLString),
        },
        permissions: {
            type: new GraphQLList(GraphQLString),
        },
        tags: {
            type: new GraphQLList(GraphQLString),
        },
        projectTag: {
            type: GraphQLID,
        },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newFileEdge: {
            type: fileConnection.edgeType,
            resolve: payload => ({
                cursor: offsetToCursor(0),
                node: payload,
            }),
        },
    },
    mutateAndGetPayload: (
        { filename, hex, permissions, tags, projectTag },
        { viewer, organization },
    ) => {
        const permissionObj = buildPermissionObject(permissions);
        return insertFile(filename, hex, permissionObj, tags, viewer, organization)
        .then(file => Activity.findOne({
            content_type: 'upload',
            'changes.user': file.creator,
            modified: { $gt: moment(file.created).subtract(10, 'minutes').toDate() },
            project: projectTag,
        })
        .exec()
        .then(activity => {
            let newActivity = activity;
            if (!newActivity) {
                newActivity = new Activity();
                newActivity.content_type = 'upload';
                newActivity.project = projectTag;
            }
            newActivity.content_ids.addToSet(file.id);
            newActivity.title = file.filename;
            newActivity.changes.push({ user: viewer.id, changed: file.created });
            newActivity.permissions = file.permissions;
            newActivity.modified = file.created;
            file.tags.forEach(tag => {
                newActivity.tags.addToSet(tag);
            });
            if (!newActivity.content) {
                newActivity.content = {};
            }
            const images = new Set(newActivity.content.images);
            const nonImages = new Set(newActivity.content.non_images);
            if (file.is_image) {
                images.add({ thumbnail_path: file.thumbnail_path, _id: file.id });
            }
            else {
                nonImages.add({ filename: file.filename, _id: file.id });
            }
            newActivity.content.images = Array.from(images);
            newActivity.content.non_images = Array.from(nonImages);
            newActivity.markModified('content');
            return newActivity.save();
        })
        .then(() => file));
    },
});

const mutationAddScore = mutationWithClientMutationId({
    name: 'AddScore',
    inputFields: {
        filename: {
            type: new GraphQLNonNull(GraphQLString),
        },
        hex: {
            type: new GraphQLNonNull(GraphQLString),
        },
        groupId: {
            type: new GraphQLNonNull(GraphQLString),
        },
        pieceId: {
            type: new GraphQLNonNull(GraphQLString),
        },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newScoreEdge: {
            type: fileConnection.edgeType,
            resolve: (payload) => ({
                cursor: offsetToCursor(0),
                node: payload.file,
            }),
        },
    },
    mutateAndGetPayload: ({ filename, hex, groupId, pieceId }, { viewer }) => {
        const pieceDbId = fromGlobalId(pieceId).id;
        const groupDbId = fromGlobalId(groupId).id;
        const permissionObj = { public: false, groups: [groupDbId], users: [] };
        return insertFile(
            filename, hex, permissionObj, [], config.files.raw_prefix, viewer, pieceDbId,
        ).then(file => {
            if (!viewer) {
                throw new Error('Nobody!');
            }
            return {
                file,
                groupId,
                pieceId,
            };
        });
    },
});

const mutationAddProject = mutationWithClientMutationId({
    name: 'AddProject',
    inputFields: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        tag: { type: GraphQLString },
        start: { type: GraphQLString },
        end: { type: GraphQLString },
        privateMdtext: { type: GraphQLString },
        publicMdtext: { type: GraphQLString },
        permissions: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newProjectEdge: {
            type: projectConnection.edgeType,
            resolve: payload => ({
                cursor: offsetToCursor(0),
                node: payload,
            }),
        },
    },
    mutateAndGetPayload: (
        { title, tag, privateMdtext, publicMdtext, start, end, permissions },
        { viewer },
    ) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const permissionObj = buildPermissionObject(permissions);
        const project = new Project();
        project.creator = viewer.id;
        project.title = title;
        const momentEnd = moment.utc(end);
        if (start) {
            project.start = moment.utc(start);
        }
        project.end = momentEnd;
        project.tag = tag;
        project.private_mdtext = privateMdtext;
        project.public_mdtext = publicMdtext;
        project.permissions = permissionObj;
        project.year = momentEnd.year();
        return project.save();
    },
});

const mutationSaveProject = mutationWithClientMutationId({
    name: 'SaveProject',
    inputFields: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        title: { type: new GraphQLNonNull(GraphQLString) },
        tag: { type: GraphQLString },
        start: { type: GraphQLString },
        end: { type: GraphQLString },
        privateMdtext: { type: GraphQLString },
        publicMdtext: { type: GraphQLString },
        permissions: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
    },
    mutateAndGetPayload: (
        { id, title, tag, privateMdtext, publicMdtext, start, end, permissions },
        { viewer },
    ) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const permissionObj = buildPermissionObject(permissions);
        let startMoment = null;
        if (start) {
            startMoment = moment.utc(start);
        }
        const endMoment = moment.utc(end);
        const projectId = fromGlobalId(id).id;
        return Project.findByIdAndUpdate(projectId, {
            title,
            tag,
            private_mdtext: privateMdtext,
            public_mdtext: publicMdtext,
            start: startMoment,
            end: endMoment,
            permissions: permissionObj,
        }).exec();
    },
});

const mutationSetPassword = mutationWithClientMutationId({
    name: 'SetPassword',
    inputFields: {
        oldPassword: { type: new GraphQLNonNull(GraphQLString) },
        newPassword: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        viewer: {
            type: userType,
            resolve: (payload, args, { viewer }) => User.findById(viewer.id),
        },
    },
    mutateAndGetPayload: ({ oldPassword, newPassword }, { viewer }) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        return User
            .findById(viewer.id)
            .select('+algorithm +password +salt')
            .exec()
            .then(user => user.authenticate(oldPassword)
                .then((ok) => {
                    if (!ok) {
                        throw new Error('Galt gammelt passord');
                    }
                    const passwordHash = user.hashPassword(newPassword);
                    user.algorithm = passwordHash.algorithm;
                    user.salt = passwordHash.salt;
                    user.password = passwordHash.hashedPassword;
                    return user.save();
                }),
            );
    },
});

const mutationSendReset = mutationWithClientMutationId({
    name: 'SendReset',
    inputFields: {
        email: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => Organization.findById(organization.id),
        },
    },
    mutateAndGetPayload: ({ email }, { organization }) => {
        if (!email) {
            return organization;
        }
        const pattern = new RegExp(email, 'i');
        return User
            .findOne({ email: { $regex: pattern } })
            .exec()
            .then((user) => {
                if (user) {
                    const code = new PasswordCode();
                    code.user = user._id;
                    return code.save().then((newCode) => {
                        const message = `Hei ${user.name}\r\n\r\nDet kan se ut som du holder på å sette nytt passord. Hvis du ikke prøver på dette, ber vi deg se bort fra denne eposten. For å sette nytt passord, må du gå til lenka:\r\n${config.site.domain}/login/reset/${newCode._id}`;
                        if (config.auth && config.auth.smtp && config.auth.smtp.host) {
                            const transporter = nodemailer.createTransport(config.auth.smtp);
                            const mailOptions = {
                                from: config.auth.smtp.noreplyAddress,
                                to: `${user.name} <${user.email}>`,
                                subject: 'Nytt passord',
                                text: message,
                            };
                            return transporter.sendMail(mailOptions)
                            .then(info => {
                                console.info('Email info:', info);
                                return organization;
                            });
                        }
                        console.info('No email config, this was the intended message', message);
                        return organization;
                    });
                }
                return organization;
            });
    },
});

const mutationJoinGroup = mutationWithClientMutationId({
    name: 'JoinGroup',
    inputFields: {
        groupId: { type: GraphQLID },
        userId: { type: GraphQLID },
    },
    outputFields: {
        group: {
            type: groupType,
            resolve: payload => payload.group,
        },
        user: {
            type: userType,
            resolve: payload => payload.user,
        },
    },
    mutateAndGetPayload: ({ groupId, userId }, { viewer, organization }) => {
        if (!admin(organization, viewer)) {
            throw new Error('No admin');
        }
        const gId = fromGlobalId(groupId).id;
        const uId = fromGlobalId(userId).id;
        return Promise.all([
            Group.findByIdAndUpdate(gId, {
                $addToSet: { members: { user: uId } },
            }, { new: true }).exec(),
            User.findByIdAndUpdate(uId, {
                $addToSet: { groups: gId },
            }, { new: true }).exec(),
        ]).then(results => ({ group: results[0], user: results[1] }));
    },
});

const mutationLeaveGroup = mutationWithClientMutationId({
    name: 'LeaveGroup',
    inputFields: {
        groupId: { type: GraphQLID },
        userId: { type: GraphQLID },
    },
    outputFields: {
        user: {
            type: userType,
            resolve: payload => payload.user,
        },
        group: {
            type: groupType,
            resolve: payload => payload.group,
        },
    },
    mutateAndGetPayload: ({ groupId, userId }, { viewer, organization }) => {
        if (!admin(organization, viewer)) {
            throw new Error('No admin');
        }
        const uId = fromGlobalId(userId).id;
        const gId = fromGlobalId(groupId).id;
        return Promise.all([
            Group.findByIdAndUpdate(gId, {
                $pull: { members: { user: uId } },
            }, { new: true }).exec(),
            User.findByIdAndUpdate(uId, {
                $pull: { groups: gId },
            }, { new: true }).exec(),
        ]).then(results => ({ group: results[0], user: results[1] }));
    },
});

const mutationSendContactEmail = mutationWithClientMutationId({
    name: 'SendContactEmail',
    inputFields: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        text: { type: new GraphQLNonNull(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: payload => payload,
        },
    },
    mutateAndGetPayload: ({ name, email, text }, { organization }) => {
        // TODO: Check email
        sendContactEmail({ name, email, text, organization });
        return organization;
    },
});

const mutationCreatePiece = mutationWithClientMutationId({
    name: 'CreatePiece',
    inputFields: {
        title: { type: new GraphQLNonNull(GraphQLString) },
        subtitle: { type: GraphQLString },
        composers: { type: new GraphQLList(GraphQLString) },
        arrangers: { type: new GraphQLList(GraphQLString) },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newPieceEdge: {
            type: pieceConnection.edgeType,
            resolve: payload => ({
                cursor: offsetToCursor(0),
                node: payload,
            }),
        },
    },
    mutateAndGetPayload: (
        { title, subtitle, composers, arrangers },
        { viewer },
    ) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        return Piece.create({ title, subtitle, composers, arrangers, creator: viewer.id });
    },
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addUser: mutationAddUser,
        editUser: mutationEditUser,
        editDescription: mutationEditDescription,
        addEvent: mutationAddEvent,
        editEvent: mutationEditEvent,
        addPage: mutationAddPage,
        editPage: mutationEditPage,
        addFile: mutationAddFile,
        addScore: mutationAddScore,
        saveFilePermissions: mutationSaveFilePermissions,
        saveOrganization: mutationSaveOrganization,
        setProjectPoster: mutationSetProjectPoster,
        addProject: mutationAddProject,
        saveProject: mutationSaveProject,
        setPassword: mutationSetPassword,
        sendReset: mutationSendReset,
        joinGroup: mutationJoinGroup,
        leaveGroup: mutationLeaveGroup,
        sendContactEmail: mutationSendContactEmail,
        createPiece: mutationCreatePiece,
    }),
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});

export default schema;
