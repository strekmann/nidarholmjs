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

import {
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
} from 'graphql-relay';

import moment from 'moment';
import { find } from 'lodash';

import { User } from '../models';

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

const { nodeInterface, nodeField } = nodeDefinitions(
    (globalId) => {
        const { type, id } = fromGlobalId(globalId);
        if (type === 'User') {
            return User.findById(id).exec().then((user) => new UserDTO(user.toObject()));
        }
        return null;
    },
    (obj) => {
        if (obj instanceof UserDTO) {
            return userType;
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

const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
        node: nodeField,
        viewer: {
            type: userType,
            resolve: ({ viewer }) => viewer,
        },
        user: {
            type: userType,
            args: {
                username: {
                    name: 'username',
                    type: new GraphQLNonNull(GraphQLString),
                },
            },
            resolve: ({ viewer }, { username }) => User.findOne({ username }).exec(),
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
