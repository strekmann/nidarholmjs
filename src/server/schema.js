/* eslint "no-console": 0 */

import config from "config";
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
} from "graphql";
import GraphQLDate from "graphql-custom-datetype";
import {
  connectionArgs,
  connectionDefinitions,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions,
  // toGlobalId,
} from "graphql-relay";
import moment from "moment";
import nodemailer from "nodemailer";
import uuid from "node-uuid";
import ObjectId from "mongoose/lib/types/objectid";

import { connectionFromMongooseQuery, offsetToCursor } from "./connections";
import Activity from "./models/Activity";
import Event from "./models/Event";
import File from "./models/File";
import Group from "./models/Group";
import Organization from "./models/Organization";
import Page from "./models/Page";
import PasswordCode from "./models/PasswordCode";
import Piece from "./models/Piece";
import Project from "./models/Project";
import Role from "./models/Role";
import User from "./models/User";
import insertFile from "./lib/insertFile";
import { buildPermissionObject } from "./lib/permissions";

let userType;
let groupType;
let organizationType;
let eventType;
let projectType;
let fileType;
let pageType;
let pieceType;
let roleType;

const { nodeInterface, nodeField } = nodeDefinitions(
  // FIXME: Add permission checks
  (globalId) => {
    const { type, id } = fromGlobalId(globalId);
    if (type === "User") {
      return User.findById(id).exec();
    }
    if (type === "Group") {
      return Group.findById(id).exec();
    }
    if (type === "Organization") {
      return Organization.findById(id).exec();
    }
    if (type === "Piece") {
      return Piece.findById(id).exec();
    }
    if (type === "Event") {
      return Event.findById(id).exec();
    }
    if (type === "Project") {
      return Project.findById(id).exec();
    }
    if (type === "File") {
      return File.findById(id).exec();
    }
    if (type === "Page") {
      return Page.findById(id).exec();
    }
    if (type === "Groupscore") {
      return Group.findById(id).exec();
    }
    if (type === "Role") {
      return Role.findById(id).exec();
    }
    return null;
  },
  (obj) => {
    if (obj._type === "User") {
      return userType;
    }
    if (obj._type === "Group") {
      return groupType;
    }
    if (obj._type === "Organization") {
      return organizationType;
    }
    if (obj._type === "Piece") {
      return pieceType;
    }
    if (obj._type === "Event") {
      return eventType;
    }
    if (obj._type === "Project") {
      return projectType;
    }
    if (obj._type === "File") {
      return fileType;
    }
    if (obj._type === "Page") {
      return pageType;
    }
    if (obj._type === "Role") {
      return roleType;
    }
    return null;
  },
);

function member(organization, user) {
  let organizationMember = { user, role: null };
  if (user) {
    organization.member_group.members.forEach((_m) => {
      if (
        (_m.user !== null &&
          typeof _m.user === "object" &&
          _m.user.id === user.id) ||
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
    organization.administration_group.members.forEach((_m) => {
      if (
        (_m.user !== null &&
          typeof _m.user === "object" &&
          _m.user.id === user.id) ||
        _m.user === user.id
      ) {
        _m.user = user;
        organizationAdmin = _m;
      }
    });
  }
  return organizationAdmin;
}

function isAdmin(organization, user) {
  return !!admin(organization, user);
}

function authenticate(query, viewer, options = {}) {
  if (viewer) {
    query.or([
      { creator: viewer.id },
      { "permissions.public": true },
      { "permissions.users": viewer.id },
      { "permissions.groups": { $in: viewer.groups } },
    ]);
  } else {
    query.where({ "permissions.public": true });
    const select = {};
    if (options.exclude) {
      options.exclude.forEach((exclude) => {
        select[exclude] = 0;
      });
    }
    if (options.include) {
      options.include.forEach((include) => {
        select[include] = 1;
      });
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
      text: text.replace("\n", "\r\n"),
    };
    transporter.sendMail(data, (emailErr, emailInfo) => {
      console.info("EMAIL", emailErr, emailInfo, data);
      if (!emailErr) {
        const receipt = {
          from: organization.email,
          to: `${name} <${email}>`,
          subject: "Melding sendt",
          text:
            "Takk!\r\n\r\nMeldingen du sendte til styret via nidarholm.no har blitt mottatt.",
        };
        transporter.sendMail(receipt, (receiptErr, receiptInfo) => {
          console.info("RECEIPT:", receiptErr, receiptInfo, receipt);
        });
      }
    });
  } else {
    console.info("EMAIL", name, email, text);
  }
}

userType = new GraphQLObjectType({
  name: "User",
  description: "A person",
  fields: () => {
    return {
      id: globalIdField("User"),
      username: { type: GraphQLString },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      isActive: {
        type: GraphQLBoolean,
        resolve: (user) => {
          return user.is_active;
        },
      },
      isAdmin: { type: GraphQLBoolean },
      isMember: { type: GraphQLBoolean },
      isMusicAdmin: { type: GraphQLBoolean },
      created: { type: GraphQLDate },
      facebookId: {
        type: GraphQLString,
        resolve: (user) => {
          return user.facebook_id;
        },
      },
      googleId: {
        type: GraphQLString,
        resolve: (user) => {
          return user.google_id;
        },
      },
      twitterId: {
        type: GraphQLString,
        resolve: (user) => {
          return user.twitter_id;
        },
      },
      nmfId: {
        type: GraphQLString,
        resolve: (user) => {
          return user.nmf_id;
        },
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
        resolve: (user) => {
          return user.instrument_insurance;
        },
      },
      reskontro: { type: GraphQLString },
      profilePicture: {
        type: fileType,
        resolve: (user) => {
          return File.findById(user.profile_picture).exec();
        },
      },
      // Deprecated:
      // profilePicturePath: {
      //     type: GraphQLString,
      //     resolve: user => user.profile_picture_path,
      // },
      membershipStatus: {
        type: GraphQLInt,
        resolve: (user) => {
          return user.membership_status;
        },
      },
      membershipHistory: {
        type: GraphQLString,
        resolve: (user, args, { organization, viewer }) => {
          if (isAdmin(organization, viewer)) {
            return User.findById(user._id)
              .select("+membership_history")
              .exec()
              .then((e) => {
                return e.membership_history;
              });
          }
          return user.membership_history;
        },
      },
      inList: {
        type: GraphQLBoolean,
        resolve: (user) => {
          return user.in_list;
        },
      },
      onLeave: {
        type: GraphQLBoolean,
        resolve: (user) => {
          return user.on_leave;
        },
      },
      noEmail: {
        type: GraphQLBoolean,
        resolve: (user) => {
          return user.no_email;
        },
      },
      groups: {
        type: new GraphQLList(groupType),
        resolve: (user) => {
          return Group.find({ "members.user": user._id }).exec();
        },
      },
    };
  },
  interfaces: [nodeInterface],
});

/*
const userConnection = connectionDefinitions({
    name: 'User',
    nodeType: userType,
});
*/

const memberType = new GraphQLObjectType({
  name: "Member",
  fields: () => {
    return {
      id: { type: GraphQLString },
      roles: {
        type: new GraphQLList(roleType),
        resolve: (_member) => {
          // populating
          return Role.find()
            .where("_id")
            .in(_member.roles)
            .exec();
        },
      },
      organizationRoles: {
        // Roles are always added at organization level
        type: new GraphQLList(roleType),
        resolve: (_member, args, { organization }) => {
          const organizationMember = organization.member_group.members.find(
            (m) => {
              if (typeof m.user === "object") {
                // "self" is actually an object. Strange populate?
                return m.user._id === _member.user;
              }
              return m.user === _member.user;
            },
          );
          if (organizationMember) {
            return Role.find()
              .where("_id")
              .in(organizationMember.roles)
              .exec();
          }
          return [];
        },
      },
      user: {
        type: userType,
        args: {
          active: { name: "active", type: GraphQLBoolean },
        },
        resolve: (_member, { active }, { viewer, organization }) => {
          // TODO: Move member features from user to member, like:
          // on_leave, in_list, etc
          let query = User.findById(_member.user);
          if (active) {
            query = query.where({
              on_leave: false,
              in_list: true,
              // membership_status: { $lt: 5 },
            });
          }
          if (!isMember(organization, viewer)) {
            query = query.select("name");
          }
          return query.exec();
        },
      },
    };
  },
});

groupType = new GraphQLObjectType({
  name: "Group",
  fields: {
    id: globalIdField("Group"),
    name: { type: GraphQLString },
    email: {
      type: GraphQLString,
      resolve: (group) => {
        return group.group_email;
      },
    },
    groupLeaderEmail: {
      type: GraphQLString,
      resolve: (group) => {
        return group.group_leader_email;
      },
    },
    externallyHidden: {
      type: GraphQLBoolean,
      resolve: (group) => {
        return group.externally_hidden;
      },
    },
    members: {
      type: new GraphQLList(memberType),
      resolve: (group, args, { organization }) => {
        const members = organization.member_group.members.map(
          (organizationMember) => {
            if (typeof organizationMember.user === "object") {
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

roleType = new GraphQLObjectType({
  name: "Role",
  description:
    "A member of an organization may have one or more roles: Titles and email address",
  fields: () => {
    return {
      id: globalIdField("Role"),
      name: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: GraphQLString },
      users: {
        type: new GraphQLList(userType),
        resolve: (role, args, { viewer, organization }) => {
          if (!admin(organization, viewer)) {
            return null;
          }
          const userIds = organization.member_group.members
            .filter((_member) => {
              return _member.roles.includes(role.id);
            })
            .map((_member) => {
              if (typeof _member.user === "object") {
                // "self" is acutally an object. strange populate?
                return _member.user._id;
              }
              return _member.user;
            });
          return User.find()
            .where("_id")
            .in(userIds)
            .exec();
        },
      },
    };
  },
  interfaces: [nodeInterface],
});

const {
  connectionType: roleConnection,
  edgeType: roleEdge,
} = connectionDefinitions({ name: "Role", nodeType: roleType });

const permissionsType = new GraphQLObjectType({
  name: "Permissions",
  fields: () => {
    return {
      public: { type: new GraphQLNonNull(GraphQLBoolean) },
      groups: {
        type: new GraphQLList(groupType),
        resolve: (permission) => {
          return permission.groups.map((groupId) => {
            return Group.findById(groupId).exec();
          });
        },
      },
      users: {
        type: new GraphQLList(userType),
        resolve: (permission) => {
          return permission.users.map((userId) => {
            return User.findById(userId).exec();
          });
        },
      },
    };
  },
});

fileType = new GraphQLObjectType({
  name: "File",
  fields: {
    id: globalIdField("File"),
    filename: { type: GraphQLString },
    created: { type: GraphQLDate },
    creator: { type: GraphQLString },
    mimetype: { type: GraphQLString },
    size: { type: GraphQLInt },
    tags: { type: new GraphQLList(GraphQLString) },
    path: { type: GraphQLString },
    thumbnailPath: {
      type: GraphQLString,
      resolve: (file) => {
        return file.thumbnail_path;
      },
    },
    normalPath: {
      type: GraphQLString,
      resolve: (file) => {
        return file.normal_path;
      },
    },
    largePath: {
      type: GraphQLString,
      resolve: (file) => {
        return file.large_path;
      },
    },
    isImage: {
      type: GraphQLBoolean,
      resolve: (file) => {
        return file.is_image;
      },
    },
    permissions: { type: permissionsType },
  },
  interfaces: [nodeInterface],
});

const fileConnection = connectionDefinitions({
  name: "File",
  nodeType: fileType,
});

/*
const scoreConnection = connectionDefinitions({
    name: 'Score',
    nodeType: fileType,
});
*/

eventType = new GraphQLObjectType({
  name: "Event",
  fields: () => {
    return {
      id: globalIdField("Event"),
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
            if (moment(event.end) < moment().startOf("day")) {
              return true;
            }
          }
          if (moment(event.start) < moment().startOf("day")) {
            return true;
          }
          return false;
        },
      },
      projects: {
        type: new GraphQLList(projectType),
        resolve: (event) => {
          return Project.find()
            .where("tag")
            .in(event.tags)
            .exec();
        },
      },
      highlighted: {
        type: GraphQLBoolean,
      },
    };
  },
  interfaces: [nodeInterface],
});
const eventConnection = connectionDefinitions({
  name: "Event",
  nodeType: eventType,
});

const groupScoreType = new GraphQLObjectType({
  name: "Groupscore",
  fields: () => {
    return {
      id: globalIdField("Groupscore"),
      name: {
        type: GraphQLString,
        resolve: (group) => {
          return group.name;
        },
      },
      files: {
        type: fileConnection.connectionType,
        resolve: (group, args, { viewer }) => {
          return Project.find()
            .where({
              end: {
                $gte: moment().subtract(1, "week"),
                $lte: moment().add(6, "months"),
              },
            })
            .then((activeProjects) => {
              const pieces = new Set();
              activeProjects.forEach((project) => {
                project.music.forEach((music) => {
                  pieces.add(music.piece);
                });
              });

              const scores = new Set();
              return Piece.find()
                .where("_id")
                .in(Array.from(pieces))
                .then((activePieces) => {
                  activePieces.forEach((activePiece) => {
                    activePiece.scores.forEach((activeScore) => {
                      scores.add(activeScore);
                    });
                  });

                  const filteredScores = group.scores.filter((score) => {
                    return viewer.isMusicAdmin || scores.has(score);
                  });

                  const query = File.find({ "permissions.groups": group.id })
                    .where("_id")
                    .in(group.scores)
                    .sort("filename");
                  if (filteredScores.length < group.scores.length) {
                    query.select("filename");
                  }
                  return connectionFromMongooseQuery(query, args);
                });
            });
        },
      },
      organization: {
        type: organizationType,
        resolve: (group, args, { organization }) => {
          return organization;
        },
      },
    };
  },
  interfaces: [nodeInterface],
});

pieceType = new GraphQLObjectType({
  name: "Piece",
  fields: () => {
    return {
      id: globalIdField("Piece"),
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
        resolve: (piece, args, { viewer }) => {
          // Find projects where piece is this piece, and project is active.
          // If some projects are returned, it means this piece should have files listed.
          // Active period is from six months before end to one week after
          return Project.find()
            .where({
              "music.piece": piece.id,
              end: {
                $gte: moment().subtract(1, "week"),
                $lte: moment().add(6, "months"),
              },
            })
            .then((activeProjectsUsingPiece) => {
              if (!activeProjectsUsingPiece.length) {
                // return empty connection
                // FIXME: This way of doing it is stupid
                return connectionFromMongooseQuery(
                  File.find().where({ _id: null }),
                );
              }
              return connectionFromMongooseQuery(
                authenticate(
                  File.find()
                    .where("_id")
                    .in(piece.scores),
                  viewer,
                ).sort("filename"),
                args,
              );
            });
        },
      },
      groupscores: {
        type: new GraphQLList(groupScoreType),
        resolve: (piece, args, { organization, viewer }) => {
          if (!viewer.isMember) {
            // throw new Error('Not a member.');
            return null;
          }
          return organization.instrument_groups.map((groupId) => {
            return Group.findById(groupId)
              .exec()
              .then((_group) => {
                const group = _group.toObject();
                group.scores = piece.scores;
                return group;
              });
          });
        },
      },
      scoreCount: {
        type: GraphQLInt,
        resolve: (piece) => {
          return piece.scores.length;
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
    };
  },
  interfaces: [nodeInterface],
});

const pieceConnection = connectionDefinitions({
  name: "Piece",
  nodeType: pieceType,
});

projectType = new GraphQLObjectType({
  name: "Project",
  fields: {
    id: globalIdField("Project"),
    title: { type: GraphQLString },
    tag: { type: GraphQLString },
    start: { type: GraphQLDate },
    end: { type: GraphQLDate },
    year: { type: GraphQLString },
    publicMdtext: {
      type: GraphQLString,
      resolve: (project) => {
        return project.public_mdtext;
      },
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
    conductors: {
      type: new GraphQLList(userType),
      resolve: (project) => {
        return User.find()
          .where("_id")
          .in(project.conductors)
          .exec();
      },
    },
    managers: {
      type: new GraphQLList(userType),
      resolve: (project) => {
        return User.find()
          .where("_id")
          .in(project.managers)
          .exec();
      },
    },
    poster: {
      type: fileType,
      resolve: (a) => {
        return File.findById(a.poster).exec();
      },
    },
    events: {
      type: eventConnection.connectionType,
      args: {
        highlighted: { type: GraphQLBoolean },
        ...connectionArgs,
      },
      resolve: (project, args, { viewer }) => {
        const query = { tags: project.tag };
        if (args.highlighted) {
          query.highlighted = args.highlighted;
        }
        return connectionFromMongooseQuery(
          authenticate(Event.find(query).sort("start"), viewer),
          args,
        );
      },
    },
    files: {
      type: fileConnection.connectionType,
      args: connectionArgs,
      resolve: (project, args, { viewer }) => {
        return connectionFromMongooseQuery(
          authenticate(File.find({ tags: project.tag }), viewer).sort({
            created: -1,
          }),
          args,
        );
      },
    },
    music: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "Music",
          fields: {
            id: { type: GraphQLString },
            piece: {
              type: pieceType,
              resolve: (music) => {
                return Piece.findById(music.piece).exec();
              },
            },
            parts: { type: GraphQLString },
          },
        }),
      ),
    },
    permissions: {
      type: permissionsType,
    },
  },
  interfaces: [nodeInterface],
});

const projectConnection = connectionDefinitions({
  name: "Project",
  nodeType: projectType,
});

pageType = new GraphQLObjectType({
  name: "Page",
  description: "Wiki page",
  fields: {
    id: globalIdField("Page"),
    slug: { type: GraphQLString },
    title: { type: GraphQLString },
    summary: { type: GraphQLString },
    mdtext: { type: GraphQLString },
    created: { type: GraphQLDate },
    creator: {
      type: userType,
      resolve: (page) => {
        return User.findById(page.creator).exec();
      },
    },
    updated: { type: GraphQLDate },
    updator: {
      type: userType,
      resolve: (page) => {
        return User.findById(page.updator).exec();
      },
    },
    permissions: {
      type: permissionsType,
    },
  },
  interfaces: [nodeInterface],
});

const pageConnection = connectionDefinitions({
  name: "Page",
  nodeType: pageType,
});

organizationType = new GraphQLObjectType({
  name: "Organization",
  description: "Organization and site info",
  fields: {
    id: globalIdField("Organization"),
    name: { type: GraphQLString },
    webdomain: { type: GraphQLString },
    mailAddress: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.mail_address;
      },
    },
    postcode: { type: GraphQLString },
    city: { type: GraphQLString },
    visitorLocation: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.visitor_location;
      },
    },
    visitorAddress: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.visitor_address;
      },
    },
    email: { type: GraphQLString },
    publicBankAccount: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.public_bank_account;
      },
    },
    organizationNumber: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.organization_number;
      },
    },
    encodedEmail: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.encoded_email;
      },
    },
    website: { type: GraphQLString },
    twitter: { type: GraphQLString },
    facebook: { type: GraphQLString },
    instagram: { type: GraphQLString },
    description_nb: { type: GraphQLString }, // TODO: Migrate
    mapUrl: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.map_url;
      },
    },
    facebookAppid: {
      type: GraphQLString,
      resolve: () => {
        return config.auth.facebook.clientId;
      },
    },
    baseurl: {
      type: GraphQLString,
      resolve: () => {
        return `${config.site.protocol}://${config.site.domain}`;
      },
    },
    contactText: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.contact_text;
      },
    },
    mapText: {
      type: GraphQLString,
      resolve: (organization) => {
        return organization.map_text;
      },
    },
    activeRoles: {
      type: new GraphQLList(roleType),
      resolve: (organization) => {
        // FIXME: When called by server, or by graphiql, member_group IS the _id.
        let memberGroupId = organization.member_group._id;
        if (!memberGroupId) {
          memberGroupId = organization.member_group;
        }
        return Group.aggregate(
          { $match: { _id: memberGroupId } },
          { $unwind: "$members" },
          { $match: { "members.roles": { $exists: 1 } } },
          { $group: { _id: "$members" } },
          { $group: { _id: "$_id.roles" } },
          { $unwind: "$_id" },
          {
            $lookup: {
              from: "roles",
              localField: "_id",
              foreignField: "_id",
              as: "_id",
            },
          },
          { $unwind: "$_id" },
          {
            $project: {
              _id: 0,
              id: "$_id._id",
              name: "$_id.name",
              email: "$_id.email",
            },
          },
        ).exec();
      },
    },
    contactRoles: {
      type: new GraphQLList(roleType),
      resolve: (organization) => {
        return organization.contactRoles.map((roleId) => {
          return Role.findById(roleId);
        });
      },
    },
    contacts: {
      type: new GraphQLList(memberType),
      resolve: (organization) => {
        return organization.contactRoles.map((roleId) => {
          return Group.aggregate(
            {
              $match: {
                _id: organization.member_group._id || organization.member_group,
              },
            },
            { $unwind: "$members" },
            { $match: { "members.roles": roleId } },
            { $group: { _id: "$members" } },
            // From mongodb 3.4, there is no need to unwind the array
            // Unwinding drops the items after the first of the array
            { $unwind: "$_id.roles" },
            {
              $lookup: {
                from: "users",
                localField: "_id.user",
                foreignField: "_id",
                as: "user",
              },
            },
            {
              $lookup: {
                from: "roles",
                localField: "_id.roles",
                foreignField: "_id",
                as: "roles",
              },
            },
            { $unwind: "$user" },
            {
              $project: {
                _id: 0,
                id: "$_id._id",
                "user._id": 1,
                "user.name": 1,
                "roles._id": 1,
                "roles.name": 1,
              },
            },
          )
            .exec()
            .then((g) => {
              return g[0];
            });
        });
      },
    },
    memberGroup: {
      type: groupType,
      resolve: (organization) => {
        return organization.member_group;
      },
    },
    musicscoreAdmins: {
      type: new GraphQLList(GraphQLString),
      resolve: (organization) => {
        return organization.musicscore_admins;
      },
    },
    isMember: {
      type: GraphQLBoolean,
      resolve: (_, args, { viewer }) => {
        return viewer.isMember;
      },
    },
    isAdmin: {
      type: GraphQLBoolean,
      resolve: (_, args, { viewer }) => {
        return viewer.isAdmin;
      },
    },
    isMusicAdmin: {
      type: GraphQLBoolean,
      resolve: (_, args, { viewer }) => {
        return viewer.isMusicAdmin;
      },
    },
    instrumentGroups: {
      type: new GraphQLList(groupType),
      resolve: (_, args, { organization }) => {
        return Organization.findById(organization.id)
          .populate({
            path: "instrument_groups",
            match: { externally_hidden: { $ne: true } },
          })
          .exec()
          .then((_organization) => {
            return _organization.instrument_groups;
          });
      },
    },
    users: {
      type: new GraphQLList(userType),
      resolve: (_, args, { organization, viewer }) => {
        let query;
        if (member(organization, viewer)) {
          query = User.find().select("name username");
        } else {
          query = User.find({ _id: { $exists: false } });
        }
        return query.sort("-created").exec();
      },
    },
    project: {
      type: projectType,
      args: {
        year: { name: "year", type: GraphQLString },
        tag: { name: "tag", type: GraphQLString },
      },
      resolve: (_, args) => {
        return Project.findOne({ tag: args.tag, year: args.year }).exec();
      },
    },
    nextProject: {
      type: projectType,
      resolve: (_, args, { viewer, organization }) => {
        let query = Project.findOne({
          end: {
            $gte: moment()
              .startOf("day")
              .toDate(),
          },
        });
        if (!isMember(organization, viewer)) {
          query = query.where({ public_mdtext: { $ne: "" } });
        }
        return authenticate(query.sort({ end: 1 }), viewer, {
          exclude: ["private_mdtext"],
        });
      },
    },
    nextProjects: {
      type: connectionDefinitions({
        name: "UpcomingProject",
        nodeType: projectType,
      }).connectionType,
      args: connectionArgs,
      resolve: (_, args, { viewer, organization }) => {
        let query = Project.find({
          end: {
            $gte: moment()
              .startOf("day")
              .toDate(),
            // $lte: moment().add(1, "year"),
          },
        });
        if (!isMember(organization, viewer)) {
          query = query.where({ public_mdtext: { $ne: "" } });
        }
        return connectionFromMongooseQuery(query.sort({ end: 1 }), args);
      },
    },
    previousProjects: {
      type: projectConnection.connectionType,
      args: connectionArgs,
      resolve: (_, { ...args }) => {
        return connectionFromMongooseQuery(
          Project.find({
            end: {
              $lt: moment()
                .startOf("day")
                .toDate(),
            },
          }).sort({ end: -1 }),
          args,
        );
      },
    },
    projects: {
      type: projectConnection.connectionType,
      args: {
        upcoming: { type: GraphQLBoolean },
        ...connectionArgs,
      },
      resolve: (_, args) => {
        const { upcoming } = args;
        let query = Project.find();
        if (upcoming) {
          query = query
            .where({
              end: {
                $gte: moment()
                  .startOf("day")
                  .toDate(),
              },
            })
            .sort({ end: 1 });
        } else {
          query = query
            .where({
              end: {
                $lt: moment()
                  .startOf("day")
                  .toDate(),
              },
            })
            .sort({ end: -1 });
        }

        return connectionFromMongooseQuery(query, args);
      },
    },
    projectTags: {
      type: new GraphQLList(projectType),
      resolve: (_, args, { viewer, organization }) => {
        if (!member(organization, viewer)) {
          return null;
        }
        return Project.find().sort({ title: 1 });
      },
    },
    event: {
      type: eventType,
      args: {
        eventid: { name: "eventid", type: GraphQLID },
      },
      resolve: (_, { eventid }, { viewer }) => {
        let { id } = fromGlobalId(eventid);
        if (!ObjectId.isValid(id)) {
          id = eventid;
        }
        const query = Event.findById(id);
        return authenticate(query, viewer, { exclude: ["mdtext"] });
      },
    },
    events: {
      type: eventConnection.connectionType,
      args: connectionArgs,
      resolve: (parent, { ...args }, { viewer }) => {
        const query = Event.find({
          start: {
            $gte: moment()
              .startOf("day")
              .toDate(),
          },
        }).sort({ start: 1 });
        return connectionFromMongooseQuery(
          authenticate(query, viewer, { exclude: ["mdtext"] }),
          args,
        );
      },
    },
    nextEvents: {
      type: eventConnection.connectionType,
      args: connectionArgs,
      resolve: (parent, { ...args }, { viewer }) => {
        const query = Event.find({
          start: {
            $gte: moment()
              .startOf("day")
              .toDate(),
            $lt: moment()
              .add(2, "months")
              .startOf("day")
              .toDate(),
          },
        }).sort({ start: 1 });
        return connectionFromMongooseQuery(
          authenticate(query, viewer, { exclude: ["mdtext"] }),
          args,
        );
      },
    },
    pages: {
      type: pageConnection.connectionType,
      args: connectionArgs,
      resolve: (_, { ...args }, { viewer }) => {
        return connectionFromMongooseQuery(
          authenticate(Page.find().sort({ created: -1 }), viewer),
          args,
        );
      },
    },
    page: {
      type: pageType,
      args: {
        slug: { name: "slug", type: GraphQLString },
      },
      resolve: (_, { slug }, { viewer }) => {
        const query = Page.findOne({ slug });
        return authenticate(query, viewer);
      },
    },
    summaries: {
      type: new GraphQLList(pageType),
      resolve: (organization) => {
        return Organization.findById(organization.id)
          .populate({ path: "summaries", select: "summary title slug" })
          .exec()
          .then((org) => {
            return org.summaries;
          });
      },
    },
    member: {
      type: memberType,
      args: {
        id: { name: "id", type: GraphQLString },
      },
      resolve: (_, { id }, { organization, viewer }) => {
        const userId = fromGlobalId(id).id;
        if (!isMember(organization, viewer) && !viewer.id === userId) {
          throw new Error("Not a member and not self");
        }
        let query = User.findById(userId);
        if (isAdmin(organization, viewer)) {
          query = query.select("+facebook_id +twitter_id +google_id +nmf_id");
          query = query.select(
            "+instrument_insurance +reskontro +membership_history",
          );
        }
        return query.exec().then((user) => {
          const m = member(organization, user);
          m.id = m._id;
          return m;
        });
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
        const tags = args.tags.split("|");
        let query = File.find().sort("-created");
        if (args.tags.length) {
          query = query.where({ tags: { $all: tags } });
        }
        return connectionFromMongooseQuery(authenticate(query, viewer), args);
      },
    },
    piece: {
      type: pieceType,
      args: {
        pieceId: { name: "pieceId", type: GraphQLString },
      },
      resolve: (_, { pieceId }, { viewer, organization }) => {
        if (!member(organization, viewer)) {
          throw new Error("Not a member, cannot see piece");
        }
        const { id } = fromGlobalId(pieceId);
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
        if (!member(organization, viewer)) {
          return null;
        }
        if (!args.term) {
          query = Piece.find();
        } else {
          const re = new RegExp(args.term, "i");
          query = Piece.find().or([
            { title: re },
            { composers: re },
            { arrangers: re },
          ]);
        }
        return connectionFromMongooseQuery(query.sort({ title: 1 }), args);
      },
    },
    tags: {
      type: new GraphQLList(
        new GraphQLObjectType({
          name: "Tag",
          fields: {
            tag: { type: GraphQLString },
            count: { type: GraphQLInt },
          },
        }),
      ),
      args: {
        tags: { type: GraphQLString },
        term: { type: GraphQLString },
      },
      resolve: (_, args, { organization, viewer }) => {
        if (!member(organization, viewer)) {
          return null;
        }
        const tags = args.tags.split("|");
        const query = [];
        if (tags.length && tags[0]) {
          query.push({ $match: { tags: { $all: tags } } });
        }
        query.push(
          { $project: { tags: 1 } },
          { $unwind: "$tags" },
          { $match: { tags: { $nin: tags, $regex: `^${args.term}` } } },
          { $group: { _id: "$tags", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 20 },
          { $project: { _id: 1, count: 1 } },
        );
        return File.aggregate(query).then((aggregatedTags) => {
          return aggregatedTags.map((tag) => {
            return {
              tag: tag._id,
              count: tag.count,
            };
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
          throw new Error("Noboby");
        }
        return query.exec();
      },
    },
    groups: {
      type: new GraphQLList(groupType),
      resolve: (_, args, { organization, viewer }) => {
        if (!admin(organization, viewer)) {
          return [];
        }
        return Group.find().sort("name");
      },
    },
    roles: {
      type: roleConnection,
      args: connectionArgs,
      resolve: (_, args, { organization, viewer }) => {
        if (!admin(organization, viewer)) {
          return connectionFromMongooseQuery(
            Role.find({ organization: null }),
            args,
          );
        }
        return connectionFromMongooseQuery(
          Role.find({ organization: organization.id }),
          args,
        );
      },
    },
  },
  interfaces: [nodeInterface],
});

const queryType = new GraphQLObjectType({
  name: "Root",
  fields: {
    viewer: {
      type: userType,
      resolve: ({ viewer }) => {
        return viewer;
      },
    },
    organization: {
      type: organizationType,
    },
    node: nodeField,
  },
});

const mutationAddEvent = mutationWithClientMutationId({
  name: "AddEvent",
  inputFields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    location: { type: GraphQLString },
    start: { type: GraphQLString },
    end: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) },
    mdtext: { type: GraphQLString },
    permissions: { type: new GraphQLList(GraphQLString) },
    highlighted: { type: GraphQLBoolean },
  },
  outputFields: {
    project: {
      type: projectType,
      resolve: (payload) => {
        return Project.findOne({ tag: payload.tags[0] }).exec();
      },
    },
    newEventEdge: {
      type: eventConnection.edgeType,
      resolve: (payload) => {
        return {
          cursor: offsetToCursor(0),
          node: payload,
        };
      },
    },
  },
  mutateAndGetPayload: (
    { title, location, start, end, tags, mdtext, permissions, highlighted },
    { viewer },
  ) => {
    if (!viewer) {
      throw new Error("Nobody!");
    }
    const event = new Event();
    event.creator = viewer.id;
    event.title = title;
    event.location = location;
    event.start = moment.utc(start);
    if (end) {
      event.end = moment.utc(end);
    }
    event.tags = tags;
    event.mdtext = mdtext;
    if (permissions) {
      event.permissions = buildPermissionObject(permissions);
    }
    event.highlighted = highlighted;
    // TODO: Check permissions
    return event.save();
  },
});

const mutationSaveFilePermissions = mutationWithClientMutationId({
  name: "SaveFilePermissions",
  inputFields: {
    fileId: { type: new GraphQLNonNull(GraphQLID) },
    permissions: { type: new GraphQLList(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
  },
  outputFields: {
    file: {
      type: fileType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ fileId, permissions, tags }, { viewer }) => {
    if (!viewer) {
      throw new Error("Nobody!");
    }
    const { id } = fromGlobalId(fileId);
    const permissionObj = buildPermissionObject(permissions);
    const query = File.findByIdAndUpdate(
      id,
      {
        permissions: permissionObj,
        tags,
      },
      { new: true },
    );
    return authenticate(query, viewer)
      .exec()
      .then((file) => {
        if (!file) {
          throw new Error("Nothing!");
        }
        Activity.findOneAndUpdate(
          { content_ids: id },
          { permissions: permissionObj },
        ).exec();
        return file;
      });
  },
});

const mutationSetProjectPoster = mutationWithClientMutationId({
  name: "SetProjectPoster",
  inputFields: {
    projectId: { type: new GraphQLNonNull(GraphQLID) },
    fileId: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    project: {
      type: projectType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ projectId, fileId }, { viewer }) => {
    const { id } = fromGlobalId(projectId);
    const posterId = fromGlobalId(fileId).id;
    if (!viewer) {
      throw new Error("Nobody!");
    }
    const query = Project.findByIdAndUpdate(
      id,
      { poster: posterId },
      { new: true },
    );
    return authenticate(query, viewer)
      .exec()
      .then((project) => {
        if (!project) {
          throw new Error("Nothing!");
        }
        return project;
      });
  },
});

const mutationEditEvent = mutationWithClientMutationId({
  name: "EditEvent",
  inputFields: {
    eventid: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    location: { type: GraphQLString },
    start: { type: new GraphQLNonNull(GraphQLString) }, // Would prefer date object
    end: { type: GraphQLString },
    mdtext: { type: GraphQLString },
    permissions: { type: new GraphQLList(GraphQLString) },
    tags: { type: new GraphQLList(GraphQLString) },
    highlighted: { type: GraphQLBoolean },
  },
  outputFields: {
    event: {
      type: eventType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    {
      eventid,
      title,
      location,
      start,
      end,
      mdtext,
      permissions,
      tags,
      highlighted,
    },
    { viewer },
  ) => {
    const { id } = fromGlobalId(eventid);
    if (!viewer) {
      throw new Error("Nobody!");
    }
    const query = Event.findByIdAndUpdate(
      id,
      {
        title,
        location,
        start,
        end,
        mdtext,
        permissions: buildPermissionObject(permissions),
        tags,
        highlighted,
        modified: moment.utc(),
      },
      { new: true },
    );
    return authenticate(query, viewer)
      .exec()
      .then((event) => {
        if (!event) {
          throw new Error("Nothing!");
        }
        return event;
      });
  },
});

const mutationAddPage = mutationWithClientMutationId({
  name: "AddPage",
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
      resolve: (payload, args, { organization }) => {
        return organization;
      },
    },
    newPageEdge: {
      type: pageConnection.edgeType,
      resolve: (payload) => {
        return {
          cursor: offsetToCursor(0),
          node: payload,
        };
      },
    },
  },
  mutateAndGetPayload: (
    { slug, mdtext, title, summary, permissions },
    { viewer },
  ) => {
    if (!viewer) {
      throw new Error("Nobody!");
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
  name: "AddUser",
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
      resolve: (payload, args, { organization }) => {
        return organization;
      },
    },
    newUser: {
      type: userType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    { name, email, instrument, isMember: setMember, groupId },
    { viewer, organization },
  ) => {
    if (!viewer) {
      throw new Error("Nobody!");
    }
    return Organization.findById(organization.id)
      .populate("member_group")
      .exec()
      .then((_organization) => {
        const userId = uuid.v4();
        const user = new User({
          _id: userId,
          username: userId,
          instrument,
          name,
          email,
        });
        let p = Promise.resolve(_organization);
        if (setMember) {
          user.groups.push(_organization.member_group);
          _organization.member_group.members.push({ user, role: instrument });
          p = _organization.member_group.save();
        }
        return p
          .then((_org) => {
            if (groupId) {
              const gId = fromGlobalId(groupId).id;
              return Group.findById(gId)
                .exec()
                .then((group) => {
                  user.groups.push(group);
                  group.members.push({ user });
                  return group.save();
                });
            }
            return Promise.resolve(_org);
          })
          .then(() => {
            return user.save();
          });
      });
  },
});

const mutationEditUser = mutationWithClientMutationId({
  name: "EditUser",
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
    user: {
      type: userType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    {
      userId,
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
      joined,
      nmfId,
      reskontro,
      membershipHistory,
      inList,
      onLeave,
      noEmail,
    },
    { viewer, organization },
  ) => {
    const { id } = fromGlobalId(userId);
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

const mutationEditContactInfo = mutationWithClientMutationId({
  name: "EditContactInfo",
  inputFields: {
    visitorAddress: { type: GraphQLID },
    visitorLocation: { type: GraphQLString },
    mailAddress: { type: GraphQLString },
    postcode: { type: GraphQLString },
    city: { type: GraphQLString },
    organizationNumber: { type: GraphQLString },
    publicBankAccount: { type: GraphQLString },
    contactText: { type: GraphQLString },
    mapText: { type: GraphQLString },
    mapUrl: { type: GraphQLString },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    {
      visitorAddress,
      visitorLocation,
      mailAddress,
      postcode,
      city,
      organizationNumber,
      publicBankAccount,
      contactText,
      mapText,
      mapUrl,
    },
    { viewer, organization },
  ) => {
    if (!isAdmin(organization, viewer)) {
      return null;
    }
    return Organization.findByIdAndUpdate(
      organization.id,
      {
        visitor_address: visitorAddress,
        visitor_location: visitorLocation,
        mail_address: mailAddress,
        postcode,
        city,
        organization_number: organizationNumber,
        public_bank_account: publicBankAccount,
        contact_text: contactText,
        map_text: mapText,
        map_url: mapUrl,
      },
      { new: true },
    ).exec();
  },
});

const mutationEditPage = mutationWithClientMutationId({
  name: "EditPage",
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
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    { pageid, slug, mdtext, title, summary, permissions },
    { viewer },
  ) => {
    const { id } = fromGlobalId(pageid);
    if (!viewer) {
      throw new Error("Nobody!");
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
    return authenticate(query, viewer)
      .exec()
      .then((page) => {
        if (!page) {
          throw new Error("Nothing!");
        }
        return page;
      });
  },
});

const mutationSaveContactRoles = mutationWithClientMutationId({
  name: "SaveContactRoles",
  inputFields: {
    contactRoles: { type: new GraphQLList(GraphQLID) },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ contactRoles }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      return null;
    }
    const roleIds = contactRoles.map((roleId) => {
      return fromGlobalId(roleId).id;
    });
    return Organization.findByIdAndUpdate(
      organization.id,
      { contactRoles: roleIds },
      { new: true },
    ).exec();
  },
});

const mutationSaveOrganization = mutationWithClientMutationId({
  name: "SaveOrganization",
  inputFields: {
    summaryIds: { type: new GraphQLList(GraphQLID) },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ summaryIds }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      return null;
    }
    const pageIds = summaryIds.map((pageId) => {
      return fromGlobalId(pageId).id;
    });
    return Organization.findByIdAndUpdate(
      organization.id,
      { summaries: pageIds },
      { new: true },
    );
  },
});

const mutationAddFile = mutationWithClientMutationId({
  name: "AddFile",
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
      resolve: (payload, args, { organization }) => {
        return organization;
      },
    },
    project: {
      type: projectType,
      resolve: (payload) => {
        return Project.findOne({ tag: payload.projectTag }).exec();
      },
    },
    newFileEdge: {
      type: fileConnection.edgeType,
      resolve: (payload) => {
        return {
          cursor: offsetToCursor(0),
          node: payload.file,
        };
      },
    },
  },
  mutateAndGetPayload: (
    { filename, hex, permissions, tags, projectTag },
    { viewer, organization },
  ) => {
    const permissionObj = buildPermissionObject(permissions);
    return insertFile(
      filename,
      hex,
      permissionObj,
      tags,
      viewer,
      organization,
    ).then((file) => {
      return Activity.findOne({
        content_type: "upload",
        "changes.user": file.creator,
        modified: {
          $gt: moment(file.created)
            .subtract(10, "minutes")
            .toDate(),
        },
        project: projectTag,
      })
        .exec()
        .then((activity) => {
          let newActivity = activity;
          if (!newActivity) {
            newActivity = new Activity();
            newActivity.content_type = "upload";
            newActivity.project = projectTag;
          }
          newActivity.content_ids.addToSet(file.id);
          newActivity.title = file.filename;
          newActivity.changes.push({ user: viewer.id, changed: file.created });
          newActivity.permissions = file.permissions;
          newActivity.modified = file.created;
          file.tags.forEach((tag) => {
            newActivity.tags.addToSet(tag);
          });
          if (!newActivity.content) {
            newActivity.content = {};
          }
          const images = new Set(newActivity.content.images);
          const nonImages = new Set(newActivity.content.non_images);
          if (file.is_image) {
            images.add({ thumbnail_path: file.thumbnail_path, _id: file.id });
          } else {
            nonImages.add({ filename: file.filename, _id: file.id });
          }
          newActivity.content.images = Array.from(images);
          newActivity.content.non_images = Array.from(nonImages);
          newActivity.markModified("content");
          return newActivity.save();
        })
        .then(() => {
          return {
            file,
            projectTag,
          };
        });
    });
  },
});

const mutationAddScore = mutationWithClientMutationId({
  name: "AddScore",
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
    piece: {
      type: pieceType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ filename, hex, groupId, pieceId }, { viewer }) => {
    const pieceDbId = fromGlobalId(pieceId).id;
    const groupDbId = fromGlobalId(groupId).id;
    const permissionObj = { public: false, groups: [groupDbId], users: [] };
    return insertFile(
      filename,
      hex,
      permissionObj,
      [],
      config.files.raw_prefix,
      viewer,
      pieceDbId,
    ).then(() => {
      if (!viewer) {
        throw new Error("Nobody!");
      }
      return Piece.findById(pieceDbId).exec();
    });
  },
});

const mutationRemoveScore = mutationWithClientMutationId({
  name: "RemoveScore",
  inputFields: {
    pieceId: { type: GraphQLID },
    fileId: { type: GraphQLID },
  },
  outputFields: {
    piece: {
      type: pieceType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ fileId, pieceId }) => {
    // TODO: Add permission check
    const fId = fromGlobalId(fileId).id;
    const pId = fromGlobalId(pieceId).id;
    return Piece.findByIdAndUpdate(
      pId,
      { $pull: { scores: fId } },
      { new: true },
    ).exec();
  },
});

const mutationAddProject = mutationWithClientMutationId({
  name: "AddProject",
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
      resolve: (payload, args, { organization }) => {
        return organization;
      },
    },
    newProjectEdge: {
      type: projectConnection.edgeType,
      resolve: (payload) => {
        return {
          cursor: offsetToCursor(0),
          node: payload,
        };
      },
    },
  },
  mutateAndGetPayload: (
    { title, tag, privateMdtext, publicMdtext, start, end, permissions },
    { viewer },
  ) => {
    console.log("Add project", title, tag, start, end, permissions, viewer._id);
    if (!viewer) {
      throw new Error("Nobody!");
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
  name: "SaveProject",
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    tag: { type: GraphQLString },
    start: { type: GraphQLString },
    end: { type: GraphQLString },
    privateMdtext: { type: GraphQLString },
    publicMdtext: { type: GraphQLString },
    permissions: { type: new GraphQLList(GraphQLString) },
    conductors: { type: new GraphQLList(GraphQLID) },
    managers: { type: new GraphQLList(GraphQLID) },
  },
  outputFields: {
    project: {
      type: projectType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    {
      id,
      title,
      tag,
      privateMdtext,
      publicMdtext,
      start,
      end,
      permissions,
      conductors,
      managers,
    },
    { viewer },
  ) => {
    if (!viewer) {
      // TODO: more
      throw new Error("Nobody!");
    }
    const permissionObj = buildPermissionObject(permissions);
    let startMoment = null;
    if (start) {
      startMoment = moment.utc(start);
    }
    const endMoment = moment.utc(end);
    const projectId = fromGlobalId(id).id;
    return Project.findByIdAndUpdate(
      projectId,
      {
        title,
        tag,
        private_mdtext: privateMdtext,
        public_mdtext: publicMdtext,
        start: startMoment,
        end: endMoment,
        permissions: permissionObj,
        conductors: conductors.map((conductor) => {
          return fromGlobalId(conductor).id;
        }),
        managers: managers.map((manager) => {
          return fromGlobalId(manager).id;
        }),
      },
      { new: true },
    ).exec();
  },
});

const mutationSetPassword = mutationWithClientMutationId({
  name: "SetPassword",
  inputFields: {
    oldPassword: { type: new GraphQLNonNull(GraphQLString) },
    newPassword: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    viewer: {
      type: userType,
      resolve: (payload, args, { viewer }) => {
        return User.findById(viewer.id);
      },
    },
  },
  mutateAndGetPayload: ({ oldPassword, newPassword }, { viewer }) => {
    if (!viewer) {
      throw new Error("Nobody!");
    }
    return User.findById(viewer.id)
      .select("+algorithm +password +salt")
      .exec()
      .then((user) => {
        return user.authenticate(oldPassword).then((ok) => {
          if (!ok) {
            throw new Error("Galt gammelt passord");
          }
          const passwordHash = user.hashPassword(newPassword);
          user.algorithm = passwordHash.algorithm;
          user.salt = passwordHash.salt;
          user.password = passwordHash.hashedPassword;
          return user.save();
        });
      });
  },
});

const mutationSendReset = mutationWithClientMutationId({
  name: "SendReset",
  inputFields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (payload, args, { organization }) => {
        return Organization.findById(organization.id);
      },
    },
  },
  mutateAndGetPayload: ({ email }, { organization }) => {
    if (!email) {
      return organization;
    }
    const pattern = new RegExp(email, "i");
    return User.findOne({ email: { $regex: pattern } })
      .exec()
      .then((user) => {
        if (user) {
          const code = new PasswordCode();
          code.user = user._id;
          return code.save().then((newCode) => {
            const message = `Hei ${
              user.name
            }\r\n\r\nDet kan se ut som du holder på å sette nytt passord. Hvis du ikke prøver på dette, ber vi deg se bort fra denne eposten. For å sette nytt passord, må du gå til lenka:\r\n${
              config.site.protocol
            }://${config.site.domain}/login/reset/${newCode._id}`;
            if (config.auth && config.auth.smtp && config.auth.smtp.host) {
              const transporter = nodemailer.createTransport(config.auth.smtp);
              const mailOptions = {
                from: config.auth.smtp.noreplyAddress,
                to: `${user.name} <${user.email}>`,
                subject: "Nytt passord",
                text: message,
              };
              return transporter.sendMail(mailOptions).then((info) => {
                console.info("Email info:", info);
                return organization;
              });
            }
            console.info(
              "No email config, this was the intended message:\n",
              message,
            );
            return organization;
          });
        }
        return organization;
      });
  },
});

const mutationJoinGroup = mutationWithClientMutationId({
  name: "JoinGroup",
  inputFields: {
    groupId: { type: GraphQLID },
    userId: { type: GraphQLID },
  },
  outputFields: {
    group: {
      type: groupType,
      resolve: (payload) => {
        return payload.group;
      },
    },
    user: {
      type: userType,
      resolve: (payload) => {
        return payload.user;
      },
    },
  },
  mutateAndGetPayload: ({ groupId, userId }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      throw new Error("No admin");
    }
    const gId = fromGlobalId(groupId).id;
    const uId = fromGlobalId(userId).id;
    return Promise.all([
      Group.findByIdAndUpdate(
        gId,
        {
          $addToSet: { members: { user: uId } },
        },
        { new: true },
      ).exec(),
      User.findByIdAndUpdate(
        uId,
        {
          $addToSet: { groups: gId },
        },
        { new: true },
      ).exec(),
    ]).then((results) => {
      return { group: results[0], user: results[1] };
    });
  },
});

const mutationLeaveGroup = mutationWithClientMutationId({
  name: "LeaveGroup",
  inputFields: {
    groupId: { type: GraphQLID },
    userId: { type: GraphQLID },
  },
  outputFields: {
    user: {
      type: userType,
      resolve: (payload) => {
        return payload.user;
      },
    },
    group: {
      type: groupType,
      resolve: (payload) => {
        return payload.group;
      },
    },
  },
  mutateAndGetPayload: ({ groupId, userId }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      throw new Error("No admin");
    }
    const uId = fromGlobalId(userId).id;
    const gId = fromGlobalId(groupId).id;
    return Promise.all([
      Group.findByIdAndUpdate(
        gId,
        {
          $pull: { members: { user: uId } },
        },
        { new: true },
      ).exec(),
      User.findByIdAndUpdate(
        uId,
        {
          $pull: { groups: gId },
        },
        { new: true },
      ).exec(),
    ]).then((results) => {
      return { group: results[0], user: results[1] };
    });
  },
});

const mutationSendContactEmail = mutationWithClientMutationId({
  name: "SendContactEmail",
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    text: { type: new GraphQLNonNull(GraphQLString) },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ name, email, text }, { organization }) => {
    // TODO: Check email
    sendContactEmail({
      name,
      email,
      text,
      organization,
    });
    return organization;
  },
});

const mutationCreatePiece = mutationWithClientMutationId({
  name: "CreatePiece",
  inputFields: {
    title: { type: new GraphQLNonNull(GraphQLString) },
    subtitle: { type: GraphQLString },
    composers: { type: new GraphQLList(GraphQLString) },
    arrangers: { type: new GraphQLList(GraphQLString) },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (payload, args, { organization }) => {
        return organization;
      },
    },
    newPieceEdge: {
      type: pieceConnection.edgeType,
      resolve: (payload) => {
        return {
          cursor: offsetToCursor(0),
          node: payload,
        };
      },
    },
  },
  mutateAndGetPayload: (
    { title, subtitle, composers, arrangers },
    { viewer },
  ) => {
    if (!viewer) {
      throw new Error("Nobody!");
    }
    return Piece.create({
      title,
      subtitle,
      composers,
      arrangers,
      creator: viewer.id,
    });
  },
});

const mutationUpdatePiece = mutationWithClientMutationId({
  name: "UpdatePiece",
  inputFields: {
    id: { type: GraphQLID },
    title: { type: new GraphQLNonNull(GraphQLString) },
    subtitle: { type: GraphQLString },
    composers: { type: new GraphQLList(GraphQLString) },
    arrangers: { type: new GraphQLList(GraphQLString) },
  },
  outputFields: {
    piece: {
      type: pieceType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    { id, title, subtitle, composers, arrangers },
    { viewer },
  ) => {
    if (!viewer) {
      throw new Error("Nobody!");
    }
    const pId = fromGlobalId(id).id;
    return Piece.findByIdAndUpdate(
      pId,
      {
        $set: {
          title,
          subtitle,
          composers,
          arrangers,
          creator: viewer.id,
        },
      },
      { new: true },
    );
  },
});

const mutationCreateRole = mutationWithClientMutationId({
  name: "CreateRole",
  inputFields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: GraphQLString },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (_, args, { organization }) => {
        return organization;
      },
    },
    newRoleEdge: {
      type: roleEdge,
      resolve: (payload) => {
        return {
          cursor: offsetToCursor(0),
          node: payload,
        };
      },
    },
  },
  mutateAndGetPayload: ({ name, email }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      return null;
    }
    return Role.create({
      name,
      email,
      organization: organization._id,
    });
  },
});

const mutationDeleteRole = mutationWithClientMutationId({
  name: "DeleteRole",
  inputFields: {
    id: { type: GraphQLID },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (_, args, { organization }) => {
        return organization;
      },
    },
    deletedRoleID: {
      type: GraphQLID,
      resolve: (payload) => {
        return payload.id;
      },
    },
  },
  mutateAndGetPayload: ({ id }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      return null;
    }
    const rId = fromGlobalId(id).id;
    return Role.findByIdAndRemove(rId).then(() => {
      return { id };
    });
  },
});

const mutationAddRole = mutationWithClientMutationId({
  name: "AddRole",
  description: "Give a role to a member of a group",
  inputFields: {
    roleId: { type: GraphQLID },
    memberId: { type: GraphQLID },
  },
  outputFields: {
    member: {
      type: memberType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ roleId, memberId }, { viewer, organization }) => {
    if (!isAdmin(organization, viewer)) {
      return null;
    }
    const rId = fromGlobalId(roleId).id;
    return Group.findOneAndUpdate(
      { "members._id": memberId },
      { $addToSet: { "members.$.roles": rId } },
      { new: true },
    )
      .exec()
      .then((group) => {
        const all = group.members.filter((_member) => {
          return _member._id.equals(memberId);
        });
        return all[0];
      });
  },
});

const mutationRemoveRole = mutationWithClientMutationId({
  name: "RemoveRole",
  description: "Remove a role from a member",
  inputFields: {
    roleId: { type: GraphQLID },
    memberId: { type: GraphQLID },
  },
  outputFields: {
    member: {
      type: memberType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ roleId, memberId }, { viewer, organization }) => {
    if (!admin(organization, viewer)) {
      return null;
    }
    const rId = fromGlobalId(roleId).id;
    return Group.findOneAndUpdate(
      { "members._id": memberId },
      { $pull: { "members.$.roles": rId } },
      { new: true },
    )
      .exec()
      .then((group) => {
        const all = group.members.filter((_member) => {
          return _member._id.equals(memberId);
        });
        return all[0];
      });
  },
});

const mutationSaveGroup = mutationWithClientMutationId({
  name: "SaveGroup",
  description: "Saving email address to email list and group leader",
  inputFields: {
    groupId: { type: GraphQLID },
    email: { type: GraphQLString },
    groupLeaderEmail: { type: GraphQLString },
  },
  outputFields: {
    group: {
      type: groupType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    { groupId, email, groupLeaderEmail },
    { viewer, organization },
  ) => {
    if (!admin(organization, viewer)) {
      return null;
    }
    const gId = fromGlobalId(groupId).id;
    return Group.findByIdAndUpdate(
      gId,
      {
        group_email: email,
        group_leader_email: groupLeaderEmail,
      },
      { new: true },
    );
  },
});

const mutationAddPiece = mutationWithClientMutationId({
  name: "AddPiece",
  description: "Add music to project",
  inputFields: {
    projectId: { type: GraphQLID },
    pieceId: { type: GraphQLID },
  },
  outputFields: {
    project: {
      type: projectType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ projectId, pieceId }, { viewer }) => {
    if (!viewer.isMusicAdmin) {
      return null;
    }
    const prId = fromGlobalId(projectId).id;
    const pId = fromGlobalId(pieceId).id;
    return Project.findByIdAndUpdate(
      prId,
      {
        $addToSet: { music: { piece: pId } },
      },
      { new: true },
    ).exec();
  },
});
const mutationRemovePiece = mutationWithClientMutationId({
  name: "RemovePiece",
  description: "Remove music to project",
  inputFields: {
    projectId: { type: GraphQLID },
    pieceId: { type: GraphQLID },
  },
  outputFields: {
    project: {
      type: projectType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ projectId, pieceId }, { viewer }) => {
    if (!viewer.isMusicAdmin) {
      return null;
    }
    const prId = fromGlobalId(projectId).id;
    const pId = fromGlobalId(pieceId).id;
    return Project.findByIdAndUpdate(
      prId,
      {
        $pull: { music: { piece: pId } },
      },
      { new: true },
    ).exec();
  },
});

const mutationDeleteEvent = mutationWithClientMutationId({
  name: "DeleteEvent",
  description: "Hide event so it is not listed",
  inputFields: {
    id: { type: GraphQLID },
  },
  outputFields: {
    organization: {
      type: organizationType,
      resolve: (_, { organization }) => {
        return organization;
      },
    },
    projects: {
      type: new GraphQLList(projectType),
      resolve: (payload) => {
        return payload.projects;
      },
    },
    deletedEventID: {
      type: GraphQLID,
      resolve: (payload) => {
        return payload.event.id;
      },
    },
  },
  mutateAndGetPayload: ({ id }, { organization, viewer }) => {
    if (!isMember(organization, viewer)) {
      return null;
    }
    const eId = fromGlobalId(id).id;
    return Event.findByIdAndRemove(eId).then((event) => {
      return Project.find()
        .where("tag")
        .in(event.tags)
        .then((projects) => {
          return {
            projects,
            event,
          };
        });
    });
  },
});

const mutationSetProfilePicture = mutationWithClientMutationId({
  name: "SetProfilePicture",
  inputFields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    hash: { type: new GraphQLNonNull(GraphQLString) },
    mimetype: { type: new GraphQLNonNull(GraphQLString) },
    size: { type: new GraphQLNonNull(GraphQLInt) },
  },
  outputFields: {
    user: {
      type: userType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: (
    { userId, hash, mimetype, size },
    { organization, viewer },
  ) => {
    if (!viewer && !isAdmin(organization, viewer)) {
      return null;
    }
    const uId = fromGlobalId(userId).id;
    return File.create({
      hash,
      mimetype,
      size,
      filename: "Profilbilde",
      creator: viewer,
      permissions: { public: false, users: [uId], groups: [] },
    }).then((file) => {
      return User.findByIdAndUpdate(
        uId,
        {
          profile_picture: file.id,
        },
        { new: true },
      );
    });
  },
});

const mutationShowContactInfo = mutationWithClientMutationId({
  name: "ShowContactInfo",
  inputFields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
  },
  outputFields: {
    user: {
      type: userType,
      resolve: (payload) => {
        return payload;
      },
    },
  },
  mutateAndGetPayload: ({ userId }, { organization }) => {
    const uId = fromGlobalId(userId).id;
    return Group.aggregate(
      { $match: { _id: organization.member_group._id } },
      { $unwind: "$members" },
      {
        $match: {
          "members.roles": { $exists: 1 },
          "members.user": uId,
        },
      },
      { $unwind: "$members.roles" },
      {
        $lookup: {
          from: "users",
          localField: "members.user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "roles",
          localField: "members.roles",
          foreignField: "_id",
          as: "roles",
        },
      },
      { $unwind: "$user" },
      { $unwind: "$roles" },
      {
        $project: {
          _id: 0,
          id: "$user._id",
          phone: "$user.phone",
          email: "$roles.email",
        },
      },
    )
      .exec()
      .then((u) => {
        if (u.length) {
          return u[0];
        }
        return null;
      });
  },
});

const mutationType = new GraphQLObjectType({
  name: "Mutation",
  fields: () => {
    return {
      addUser: mutationAddUser,
      editUser: mutationEditUser,
      addEvent: mutationAddEvent,
      editEvent: mutationEditEvent,
      addPage: mutationAddPage,
      editPage: mutationEditPage,
      addFile: mutationAddFile,
      addScore: mutationAddScore,
      removeScore: mutationRemoveScore,
      saveFilePermissions: mutationSaveFilePermissions,
      saveOrganization: mutationSaveOrganization,
      saveContactRoles: mutationSaveContactRoles,
      setProjectPoster: mutationSetProjectPoster,
      addProject: mutationAddProject,
      saveProject: mutationSaveProject,
      setPassword: mutationSetPassword,
      sendReset: mutationSendReset,
      joinGroup: mutationJoinGroup,
      leaveGroup: mutationLeaveGroup,
      sendContactEmail: mutationSendContactEmail,
      createPiece: mutationCreatePiece,
      updatePiece: mutationUpdatePiece,
      createRole: mutationCreateRole,
      deleteRole: mutationDeleteRole,
      addRole: mutationAddRole,
      removeRole: mutationRemoveRole,
      saveGroup: mutationSaveGroup,
      addPiece: mutationAddPiece,
      removePiece: mutationRemovePiece,
      deleteEvent: mutationDeleteEvent,
      setProfilePicture: mutationSetProfilePicture,
      showContactInfo: mutationShowContactInfo,
      editContactInfo: mutationEditContactInfo,
    };
  },
});

export default new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});
