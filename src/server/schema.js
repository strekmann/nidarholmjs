import {
    GraphQLBoolean,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLString,
    GraphQLInt,
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

import connectionFromMongooseQuery from 'relay-mongoose-connection';
import moment from 'moment';

import { User, Group, Organization } from './models';
import { File } from './models/files';
import { Project, Event } from './models/projects';

class UserDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class GroupDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class OrganizationDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class EventDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class ProjectDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class FileDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

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
            return Organization.findById(id).exec().then((organization) => new OrganizationDTO(organization.toObject()));
        }
        if (type === 'Event') {
            return Event.findById(id).exec().then((event) => new EventDTO(event.toObject()));
        }
        if (type === 'Project') {
            return Project.findById(id).exec().then((project) => new ProjectDTO(project.toObject()));
        }
        if (type === 'File') {
            return File.findById(id).exec().then((file) => new FileDTO(file.toObject()));
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
        if (obj instanceof EventDTO) {
            return eventType;
        }
        if (obj instanceof ProjectDTO) {
            return projectType;
        }
        if (obj instanceof FileDTO) {
            return fileType;
        }
        return null;
    }
);

function authenticate(query, viewer, options) {
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

const userType = new GraphQLObjectType({
    name: 'User',
    description: 'A person',
    fields: {
        id: globalIdField('User'),
        name: { type: GraphQLString },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        instrument: { type: GraphQLString },
        membership_status: { type: GraphQLInt },
        created: { type: GraphQLString },
        updated: { type: GraphQLString },
    },
    interfaces: [nodeInterface],
});

const fileType = new GraphQLObjectType({
    name: 'File',
    fields: {
        id: globalIdField('File'),
        filename: { type: GraphQLString },
        thumbnail_path: { type: GraphQLString },
        normal_path: { type: GraphQLString },
        large_path: { type: GraphQLString },
    },
    interfaces: [nodeInterface],
});

const eventType = new GraphQLObjectType({
    name: 'Event',
    fields: {
        id: globalIdField('Event'),
        title: { type: GraphQLString },
        location: { type: GraphQLString },
        start: { type: GraphQLDate },
        end: { type: GraphQLDate },
        tags: { type: new GraphQLList(GraphQLString) },
        mdtext: { type: GraphQLString },
    },
    interfaces: [nodeInterface],
});

const projectType = new GraphQLObjectType({
    name: 'Project',
    fields: {
        id: globalIdField('Project'),
        title: { type: GraphQLString },
        tag: { type: GraphQLString },
        start: { type: GraphQLDate },
        end: { type: GraphQLDate },
        year: { type: GraphQLString },
        public_mdtext: { type: GraphQLString },
        conductors: { type: new GraphQLList(userType) },
        poster: {
            type: fileType,
            resolve: (a) => File.findById(a.poster).exec(),
        },
    },
    interfaces: [nodeInterface],
});

const groupType = new GraphQLObjectType({
    name: 'Group',
    fields: {
        id: globalIdField('Group'),
        name: { type: GraphQLString },
        externally_hidden: { type: GraphQLBoolean },
        members: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'Member',
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
                        name: 'Role',
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

const organizationType = new GraphQLObjectType({
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
        instrument_groups: {
            type: new GraphQLList(groupType),
            resolve: (_, args, { organization }) => Organization
            .findById(organization.id)
            .populate('instrument_groups')
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
            type: connectionDefinitions({ name: 'Event', nodeType: eventType }).connectionType,
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
            /*
            resolve: ((a, args, context, root) => {
                //console.log("A", context);
                return context;
            }),
            resolve: ({ organization, viewer }) => {
                console.log("ORG", organization, viewer);
                return { organization, viewer };
            },
            */
        },
    },
});

const mutationEditDescription = mutationWithClientMutationId({
    name: 'EditDescription',
    inputFields: {
        userid: { type: new GraphQLNonNull(GraphQLID) },
        orgid: { type: new GraphQLNonNull(GraphQLID) },
        description_nb: { type: GraphQLString },
    },
    outputFields: {
        organization: {
            type: organizationType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ userid, orgid, description_nb }) => {
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

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        editDescription: mutationEditDescription,
        editEvent: mutationEditEvent,
    }),
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});

export default schema;
