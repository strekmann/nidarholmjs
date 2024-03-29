// @ts-nocheck

import queryMiddleware from "farce/queryMiddleware";
import createRender from "found/createRender";
import makeRouteConfig from "found/makeRouteConfig";
import Route from "found/Route";
import { Resolver } from "found-relay";
import React from "react";
import { graphql } from "react-relay";
import { Environment, Network, RecordSource, Store } from "relay-runtime";

import App from "./common/components/App";
import Home from "./common/components/Home";
import Login from "./common/components/Login";
import Contact from "./common/components/Contact";
import Reset from "./common/components/Reset";
import Event from "./common/components/Event";
import EventResponsibilities from "./common/components/EventResponsibilities";
import Events from "./common/components/Events";
import Files from "./common/components/Files";
import Group from "./common/components/Group";
import Groups from "./common/components/Groups";
import Member from "./common/components/Member";
import MemberReset from "./common/components/MemberReset";
import Members from "./common/components/Members";
import NoMatch from "./common/components/NoMatch";
import Organization from "./common/components/Organization";
import Page from "./common/components/Page";
import Pages from "./common/components/Pages";
import Piece from "./common/components/Piece";
import Pieces from "./common/components/Pieces";
import Project from "./common/components/Project";
import Projects from "./common/components/Projects";
import Roles from "./common/components/Roles";

export const historyMiddlewares = [queryMiddleware];

export function createResolver(fetcher) {
  const environment = new Environment({
    network: Network.create((...args) => {
      return fetcher.fetch(...args);
    }),
    store: new Store(new RecordSource()),
  });

  return new Resolver(environment);
}

const routes = (
  <Route
    path="/"
    Component={App}
    query={graphql`
      query router_App_Query {
        viewer {
          ...App_viewer
        }
        organization {
          ...App_organization
        }
      }
    `}
  >
    <Route
      Component={Home}
      query={graphql`
        query router_Home_Query {
          viewer {
            ...Home_viewer
          }
          organization {
            ...Home_organization
          }
        }
      `}
    />
    <Route path="login">
      <Route Component={Login} />
      <Route
        path="reset"
        Component={Reset}
        query={graphql`
          query router_Reset_Query {
            organization {
              ...Reset_organization
            }
          }
        `}
      />
    </Route>
    <Route
      path="admin"
      Component={Organization}
      query={graphql`
        query router_Organization_Query {
          organization {
            ...Organization_organization
          }
        }
      `}
    />
    <Route
      path="members"
      Component={Members}
      query={graphql`
        query router_Members_Query {
          organization {
            ...Members_organization
          }
        }
      `}
    />
    <Route
      path="members/roles"
      Component={Roles}
      query={graphql`
        query router_Roles_Query {
          organization {
            ...Roles_organization
          }
        }
      `}
    />
    <Route path="users/:id">
      <Route
        Component={Member}
        query={graphql`
          query router_Member_Query($id: String) {
            organization {
              ...Member_organization
            }
            viewer {
              ...Member_viewer
            }
          }
        `}
      />
      <Route
        path="reset/:code"
        Component={MemberReset}
        query={graphql`
          query router_MemberReset_Query($code: String) {
            organization {
              ...MemberReset_organization
            }
            viewer {
              ...MemberReset_viewer
            }
          }
        `}
      />
    </Route>
    <Route
      path="groups"
      Component={Groups}
      query={graphql`
        query router_Groups_Query {
          organization {
            ...Groups_organization
          }
          viewer {
            ...Groups_viewer
          }
        }
      `}
    />
    <Route
      path="group/:groupId"
      Component={Group}
      query={graphql`
        query router_Group_Query($groupId: ID) {
          organization {
            ...Group_organization
          }
          viewer {
            ...Group_viewer
          }
        }
      `}
    />
    <Route
      path="contact"
      Component={Contact}
      query={graphql`
        query router_Contact_Query {
          organization {
            ...Contact_organization
          }
        }
      `}
    />
    <Route
      path="files"
      Component={Files}
      query={graphql`
        query router_Files_Query {
          organization {
            ...Files_organization
          }
          viewer {
            ...Files_viewer
          }
        }
      `}
    />
    <Route
      path="music"
      Component={Pieces}
      query={graphql`
        query router_Pieces_Query {
          organization {
            ...Pieces_organization
          }
        }
      `}
    />
    <Route
      path="music/:pieceId"
      Component={Piece}
      query={graphql`
        query router_Piece_Query($pieceId: String) {
          organization {
            ...Piece_organization
          }
          viewer {
            ...Piece_viewer
          }
        }
      `}
    />
    <Route
      path="projects"
      Component={Projects}
      query={graphql`
        query router_Projects_Query {
          viewer {
            ...Projects_viewer
          }
          organization {
            ...Projects_organization
          }
        }
      `}
    />
    <Route
      path="events"
      Component={Events}
      query={graphql`
        query router_Events_Query {
          organization {
            ...Events_organization
          }
        }
      `}
    />
    <Route
      path="events/responsibilities"
      Component={EventResponsibilities}
      query={graphql`
        query router_EventResponsibilities_Query {
          organization {
            ...EventResponsibilities_organization
          }
        }
      `}
    />
    <Route
      path="events/:eventId"
      Component={Event}
      query={graphql`
        query router_Event_Query($eventId: ID) {
          organization {
            ...Event_organization
          }
          viewer {
            ...Event_viewer
          }
        }
      `}
    />
    <Route
      path="pages"
      Component={Pages}
      query={graphql`
        query router_Pages_Query {
          viewer {
            ...Pages_viewer
          }
          organization {
            ...Pages_organization
          }
        }
      `}
    />
    <Route
      path=":year/:tag"
      Component={Project}
      variables={{
        year: null,
        tag: "",
      }}
      query={graphql`
        query router_Project_Query($year: String, $tag: String) {
          viewer {
            ...Project_viewer
          }
          organization {
            ...Project_organization
          }
        }
      `}
    />
    <Route
      path=":slug"
      Component={Page}
      variables={{ slug: null }}
      query={graphql`
        query router_Page_Query($slug: String) {
          viewer {
            ...Page_viewer
          }
          organization {
            ...Page_organization
          }
        }
      `}
    />
    <Route path="*" Component={NoMatch} />
  </Route>
);

export const routeConfig = makeRouteConfig(routes);

export const render = createRender({});
