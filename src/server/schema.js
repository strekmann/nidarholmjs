import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
    GraphQLInputObjectType,
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

import connectionFromMongooseQuery, { offsetToCursor } from 'relay-mongoose-connection';
import moment from 'moment';
import config from 'config';

import { User, Group, Organization } from './models';
import { File } from './models/files';
import { Project, Event, Piece } from './models/projects';
import { Page } from './models/pages';

import { insert_file as insertFile } from './lib/util';

let userType;
let groupType;
let organizationType;
let eventType;
let projectType;
let fileType;
let pageType;
let pieceType;

class UserDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class GroupDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class OrganizationDTO { constructor(o) { for (const k of Object.keys(o)) { this[k] = o[k]; } } }
class PieceDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class EventDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class ProjectDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class FileDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class PageDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class GroupscoreDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            return User.findById(id).exec().then((user) => new UserDTO(user.toObject()));
        }
        if (type === 'Group') {
            return Group.findById(id).exec().then((group) => new GroupDTO(group.toObject()));
        }
        if (type === 'Organization') {
            return Organization.findById(id).exec().then(
                (organization) => new OrganizationDTO(organization.toObject())
            );
        }
        if (type === 'Piece') {
            return Piece.findById(id).exec().then((piece) => new PieceDTO(piece.toObject()));
        }
        if (type === 'Event') {
            return Event.findById(id).exec().then((event) => new EventDTO(event.toObject()));
        }
        if (type === 'Project') {
            return Project.findById(id).exec().then(
                (project) => new ProjectDTO(project.toObject())
            );
        }
        if (type === 'File') {
            return File.findById(id).exec().then((file) => new FileDTO(file.toObject()));
        }
        if (type === 'Page') {
            return Page.findById(id).exec().then((page) => new PageDTO(page.toObject()));
        }
        if (type === 'Groupscore') {
            return Group.findById(id).exec().then((group) => new GroupscoreDTO(group.toObject()));
        }
        return null;
    },
    (obj) => {
        if (obj instanceof UserDTO) {
            return userType;
        }
        if (obj instanceof GroupDTO) {
            return groupType;
        }
        if (obj instanceof OrganizationDTO) {
            return organizationType;
        }
        if (obj instanceof PieceDTO) {
            return pieceType;
        }
        if (obj instanceof EventDTO) {
            return eventType;
        }
        if (obj instanceof ProjectDTO) {
            return projectType;
        }
        if (obj instanceof FileDTO) {
            return fileType;
        }
        if (obj instanceof PageDTO) {
            return pageType;
        }
        if (obj instanceof GroupscoreDTO) {
            return groupScoreType;
        }
        return null;
    }
);

function member(organization, user) {
    let organizationMember = null;
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

userType = new GraphQLObjectType({
    name: 'User',
    description: 'A person',
    fields: () => ({
        id: globalIdField('User'),
        username: { type: GraphQLString },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        is_active: { type: GraphQLBoolean },
        is_admin: { type: GraphQLBoolean },
        created: { type: GraphQLDate },
        facebook_id: { type: GraphQLString },
        google_id: { type: GraphQLString },
        twitter_id: { type: GraphQLString },
        nmf_id: { type: GraphQLString },
        phone: { type: GraphQLString },
        address: { type: GraphQLString },
        postcode: { type: GraphQLString },
        city: { type: GraphQLString },
        country: { type: GraphQLString },
        born: { type: GraphQLDate },
        joined: { type: GraphQLDate },
        instrument: { type: GraphQLString },
        instrument_insurance: { type: GraphQLBoolean },
        reskontro: { type: GraphQLString },
        profile_picture: { type: GraphQLString },
        profile_picture_path: { type: GraphQLString },
        membership_status: { type: GraphQLInt },
        membership_history: { type: GraphQLString },
        in_list: { type: GraphQLBoolean },
        on_leave: { type: GraphQLBoolean },
        no_email: { type: GraphQLBoolean },
        groups: {
            type: new GraphQLList(groupType),
            resolve: user => User
            .findById(user.id)
            .populate({
                path: 'groups',
            })
            .exec()
            .then(
                _user => _user.groups
            ),
        },
    }),
    interfaces: [nodeInterface],
});

groupType = new GraphQLObjectType({
    name: 'Group',
    fields: {
        id: globalIdField('Group'),
        name: { type: GraphQLString },
        externally_hidden: { type: GraphQLBoolean },
        members: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'GroupMember',
                fields: {
                    id: { type: GraphQLString },
                    user: {
                        type: userType,
                        resolve: (member) => User.findById(member.user).where({
                            on_leave: false,
                            in_list: true,
                            membership_status: { $lt: 5 },
                        }).exec(),
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
                const members = organization.member_group.members.map(member => member.user);
                return group.members.filter(member => {
                    if (members.includes(member.user)) {
                        return true;
                    }
                    return false;
                });
            },
        },
    },
    interfaces: [nodeInterface],
});

const groupConnection = connectionDefinitions({
    name: 'Group',
    nodeType: groupType,
});


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
        thumbnail_path: { type: GraphQLString },
        normal_path: { type: GraphQLString },
        large_path: { type: GraphQLString },
        is_image: { type: GraphQLBoolean },
        permissions: { type: permissionsType },
    },
    interfaces: [nodeInterface],
});

const fileConnection = connectionDefinitions({
    name: 'File',
    nodeType: fileType,
});

const scoreConnection = connectionDefinitions({
    name: 'Score',
    nodeType: fileType,
});

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
    },
    interfaces: [nodeInterface],
});
const eventConnection = connectionDefinitions({
    name: 'Event',
    nodeType: eventType,
});

const groupScoreType = new GraphQLObjectType({
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

projectType = new GraphQLObjectType({
    name: 'Project',
    fields: {
        id: globalIdField('Project'),
        title: { type: GraphQLString },
        tag: { type: GraphQLString },
        start: { type: GraphQLDate },
        end: { type: GraphQLDate },
        year: { type: GraphQLString },
        public_mdtext: { type: GraphQLString },
        private_mdtext: { type: GraphQLString },
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
    },
    interfaces: [nodeInterface],
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
        mail_address: { type: GraphQLString },
        postcode: { type: GraphQLString },
        city: { type: GraphQLString },
        email: { type: GraphQLString },
        public_bank_account: { type: GraphQLString },
        organization_number: { type: GraphQLString },
        encoded_email: { type: GraphQLString },
        website: { type: GraphQLString },
        twitter: { type: GraphQLString },
        facebook: { type: GraphQLString },
        description_nb: { type: GraphQLString }, // TODO: Migrate
        map_url: { type: GraphQLString },
        contact_text: { type: GraphQLString },
        member_group: { type: groupType },
        musicscore_admins: { type: new GraphQLList(GraphQLString) },
        is_member: {
            type: GraphQLBoolean,
            resolve: (_, args, { organization, viewer }) => member(organization, viewer),
        },
        is_musicscoreadmin: {
            type: GraphQLBoolean,
            resolve: (_, args, { organization, viewer }) => musicscoreadmin(organization, viewer),
        },
        instrument_groups: {
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
            resolve: (_, args, { viewer }) => authenticate(
                Project
                .findOne({ end: { $gte: moment().startOf('day').toDate() } })
                .sort({ end: 1 }),
                viewer,
                { exclude: ['private_mdtext'] },
            ),
        },
        nextProjects: {
            type: connectionDefinitions({
                name: 'UpcomingProject',
                nodeType: projectType,
            }).connectionType,
            args: connectionArgs,
            resolve: (_, { ...args }) => connectionFromMongooseQuery(
                Project.find({
                    end: { $gte: moment().startOf('day').toDate() },
                }).sort({ end: 1 }),
                args,
            ),
        },
        previousProjects: {
            type: connectionDefinitions({
                name: 'Project',
                nodeType: projectType,
            }).connectionType,
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
                username: { name: 'username', type: GraphQLString },
            },
            resolve: (_, { username }, { organization, viewer }) => {
                if (!member(organization, viewer)) {
                    throw new Error('Nobody');
                }
                let query = User.findOne({ username });
                if (admin(organization, viewer)) {
                    query = query.select('+facebook_id +twitter_id +google_id +nmf_id');
                    query = query.select('+instrument_insurance +reskontro +membership_history');
                }
                return query.exec().then(user => member(organization, user));
            },
        },
        files: {
            type: fileConnection.connectionType,
            args: connectionArgs,
            resolve: (_, { ...args }, { viewer }) => connectionFromMongooseQuery(
                authenticate(File.find().sort({ created: -1 }), viewer),
                args,
            ),
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
            resolve: (payload, args, { viewer }) => {
                return {
                    cursor: offsetToCursor(0),
                    node: payload,
                };
            },
        },
    },
    mutateAndGetPayload: ({ title, location, start, end, tags, mdtext, permissions }, { viewer }) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const userId = viewer.id;
        const permissionObj = { public: false, groups: [], users: [] };
        permissions.forEach(permission => {
            if (permission === 'p') {
                permissionObj.public = true;
            }
            const idObj = fromGlobalId(permission);
            if (idObj.type === 'Group') {
                permissionObj.groups.push(idObj.id);
            }
            else if (idObj.type === 'User') {
                permissionObj.users.push(idObj.id);
            }
        });
        const event = new Event();
        event.creator = userId;
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
            resolve: (payload, args, { viewer }) => {
                return {
                    cursor: offsetToCursor(0),
                    node: payload,
                };
            },
        },
    },
    mutateAndGetPayload: ({ slug, mdtext, title, summary, permissions }, { viewer }) => {
        if (!viewer) {
            throw new Error('Nobody!');
        }
        const userId = viewer.id;
        const permissionObj = { public: false, groups: [], users: [] };
        permissions.forEach(permission => {
            if (permission === 'p') {
                permissionObj.public = true;
            }
            const idObj = fromGlobalId(permission);
            if (idObj.type === 'Group') {
                permissionObj.groups.push(idObj.id);
            }
            else if (idObj.type === 'User') {
                permissionObj.users.push(idObj.id);
            }
        });
        const page = new Page();
        page._id = slug;
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
        const permissionObj = { public: false, groups: [], users: [] };
        permissions.forEach(permission => {
            if (permission === 'p') {
                permissionObj.public = true;
            }
            const idObj = fromGlobalId(permission);
            if (idObj.type === 'Group') {
                permissionObj.groups.push(idObj.id);
            }
            else if (idObj.type === 'User') {
                permissionObj.users.push(idObj.id);
            }
        });
        const query = Page.findByIdAndUpdate(
            id,
            { slug, mdtext, summary, title, permissions: permissionObj },
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
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload, args, { organization }) => organization,
        },
        newFileEdge: {
            type: fileConnection.edgeType,
            resolve: (payload, args, { viewer }) => {
                return {
                    cursor: offsetToCursor(0),
                    node: payload,
                };
            },
        },
    },
    mutateAndGetPayload: ({ filename, hex, permissions, tags }, { viewer }) => {
        const permissionObj = { public: false, groups: [], users: [] };
        permissions.forEach(permission => {
            if (permission === 'p') {
                permissionObj.public = true;
            }
            const idObj = fromGlobalId(permission);
            if (idObj.type === 'Group') {
                permissionObj.groups.push(idObj.id);
            }
            else if (idObj.type === 'User') {
                permissionObj.users.push(idObj.id);
            }
        });
        return insertFile(filename, hex, permissionObj, tags, config.files.raw_prefix, viewer);
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
            resolve: (payload) => {
                return {
                    cursor: offsetToCursor(0),
                    node: payload.file,
                };
            },
        },
    },
    mutateAndGetPayload: ({ filename, hex, groupId, pieceId }, { viewer }) => {
        const pieceDbId = fromGlobalId(pieceId).id;
        const groupDbId = fromGlobalId(groupId).id;
        const permissionObj = { public: false, groups: [groupDbId], users: [] };
        return insertFile(
            filename, hex, permissionObj, config.files.raw_prefix, viewer, pieceDbId,
        ).then(file => {
            return {
                file,
                groupId,
                pieceId,
            };
        });
    },
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        editDescription: mutationEditDescription,
        addEvent: mutationAddEvent,
        editEvent: mutationEditEvent,
        addPage: mutationAddPage,
        editPage: mutationEditPage,
        addFile: mutationAddFile,
        addScore: mutationAddScore,
    }),
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});

export default schema;
