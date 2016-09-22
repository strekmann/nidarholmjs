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

import connectionFromMongooseQuery from 'relay-mongoose-connection';
import marked from 'marked';
import moment from 'moment';

import { User, Organization } from '../models';
import { File } from '../models/files';
import { Project } from '../models/projects';

import config from 'config';
import nodemailer from 'nodemailer';

let transporter;
if (config.mail && config.mail.auth && config.mail.host) {
    transporter = nodemailer.createTransport({
        secure: true,
        host: config.mail.host,
        auth: config.mail.auth,
    });
}
else {
    transporter = nodemailer.createTransport();
}

class UserDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class OrganizationDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class ProjectDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }
class FileDTO { constructor(obj) { for (const k of Object.keys(obj)) { this[k] = obj[k]; } } }

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            return User.findById(id).exec().then((user) => new UserDTO(user.toObject()));
        }
        if (type === 'Organization') {
            return Organization.findById(id).exec().then((organization) => new OrganizationDTO(organization.toObject()));
        }
        if (type === 'Project') {
            return Project.findById(id).exec().then((project) => new ProjectDTO(project.toObject()));
        }
        if (type === 'File') {
            return File.findById(id).exec().then((file) => new FileDTO(project.toObject()));
        }
        return null;
    },
    (obj) => {
        if (obj instanceof UserDTO) {
            return userType;
        }
        if (obj instanceof OrganizationDTO) {
            return organizationType;
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

const userType = new GraphQLObjectType({
    name: 'User',
    description: 'A person',
    fields: {
        id: globalIdField('User'),
        name: { type: GraphQLString },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
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

const projectType = new GraphQLObjectType({
    name: 'Project',
    fields: {
        //id: { type: GraphQLString },
        id: globalIdField('Organization'),
        title: { type: GraphQLString },
        tag: { type: GraphQLString },
        start: { type: GraphQLDate },
        end: { type: GraphQLDate },
        year: { type: GraphQLString },
        public_mdtext: { type: GraphQLString },
        conductors: { type: new GraphQLList(userType) },
        poster: {
            type: fileType,
            resolve: (a) => {
                return File.findById(a.poster).exec();
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
            async resolve() {
                return await Project
                .findOne({ end: { $gte: moment().startOf('day').toDate() } })
                .sort({ end: 1 })
                .exec();
            },
        },
        nextProjects: {
            type: connectionDefinitions({ name: 'UpcomingProject', nodeType: projectType }).connectionType,
            args: connectionArgs,
            async resolve(term, { ...args }) { // term here is unused for now, coming from server
                return await connectionFromMongooseQuery(
                    Project.find({
                        end: { $gte: moment().startOf('day').toDate() },
                    }).sort({ end: 1 }),
                    args,
                );
            },
        },
        previousProjects: {
            type: connectionDefinitions({ name: 'Project', nodeType: projectType }).connectionType,
            args: connectionArgs,
            async resolve(term, { ...args }) { // term here is unused for now, coming from server
                return await connectionFromMongooseQuery(
                    Project.find({
                        end: { $lt: moment().startOf('day').toDate() },
                    }).sort({ end: -1 }),
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
            /*
            args: {
                username: {
                    name: 'username',
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            */
            type: organizationType,
            resolve: ({ organization }) => organization,
        },
    },
});

const mutationUserUpdate = mutationWithClientMutationId({
    name: 'UpdateUser',
    inputFields: {
        userid: { type: new GraphQLNonNull(GraphQLID) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        message: { type: GraphQLString },
    },
    outputFields: {
        viewer: {
            type: userType,
            resolve: (payload) => payload,
        },
    },
    mutateAndGetPayload: ({ userid, email, message, participants }) => {
        const id = fromGlobalId(userid).id;
        return User.findByIdAndUpdate(
            id,
            { email, message, participants, updated: moment.utc().toDate() },
            { new: true },
        ).exec().then(user => {
            if (message && config.mail && user) {
                transporter.sendMail({
                    to: config.mail.to || 'sigurdga-nidarholm-test@sigurdga.no',
                    from: config.mail.from || 'drangen@nidarholm.no',
                    subject: `Ny kommentar fra ${user.name}`,
                    text: message,
                }, (error, info) => {
                    if (error) {
                        return console.error(error);
                    }
                    console.log(`Message sent: ${info.response}`);
                    return false;
                });
            }
            return JSON.parse(JSON.stringify(user));
        });
    },
});

const mutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        updateUser: mutationUserUpdate,
    }),
});

const schema = new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
});

export default schema;