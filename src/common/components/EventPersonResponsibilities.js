// @flow

import { List, ListItem } from "material-ui/List";
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from "material-ui/Table";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import EventPersonResponsibilityChooser from "./EventPersonResponsibilityChooser";
import EventPersonResponsibilitiesOrganization from "./__generated__/EventPersonResponsibilities_organization.graphql";

type Props = {
  organization: EventPersonResponsibilitiesOrganization,
};

type State = {};

class EventPersonResponsibilities extends React.Component<Props, State> {
  flattenMemberList = (groups) => {
    let users = [];
    groups.forEach((group) => {
      const members = [];
      group.members.forEach((member) => {
        if (member.user) {
          members.push(member.user);
        }
      });
      members.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        return -1;
      });
      users = users.concat(members);
    });
    return users;
  };
  render() {
    const {
      events,
      instrumentGroups,
      organizationEventPersonResponsibilities,
    } = this.props.organization;
    const users = this.flattenMemberList(instrumentGroups);
    return (
      <Table>
        <TableHeader displaySelectAll={false}>
          <TableRow>
            <TableHeaderColumn />
            {organizationEventPersonResponsibilities.map((responsibility) => {
              return (
                <TableHeaderColumn key={responsibility.id}>
                  {responsibility.name}
                </TableHeaderColumn>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {events.edges.map((edge) => {
            return (
              <TableRow key={edge.node.id} selectable={false}>
                <TableRowColumn>
                  <h2>{edge.node.title}</h2>
                  <List>
                    {edge.node.contributors.map((contributor) => {
                      return (
                        <ListItem
                          disabled
                          key={`${contributor.user.id}-${contributor.role.id}`}
                          primaryText={contributor.user.name}
                          secondaryText={contributor.role.name}
                        />
                      );
                    })}
                  </List>
                </TableRowColumn>
                {organizationEventPersonResponsibilities.map(
                  (responsibility) => {
                    return (
                      <TableRowColumn
                        key={`${edge.node.id}-${responsibility.id}`}
                      >
                        <EventPersonResponsibilityChooser
                          organizationEventPersonResponsibility={responsibility}
                          users={users}
                          event={edge.node}
                        />
                      </TableRowColumn>
                    );
                  },
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }
}

export default createFragmentContainer(EventPersonResponsibilities, {
  organization: graphql`
    fragment EventPersonResponsibilities_organization on Organization
      @argumentDefinitions(showItems: { type: "Int", defaultValue: 20 }) {
      organizationEventPersonResponsibilities {
        id
        name
        last {
          id
          name
        }
        ...EventPersonResponsibilityChooser_organizationEventPersonResponsibility
      }
      instrumentGroups {
        members {
          user(active: true) {
            id
            name
          }
        }
      }
      events(first: $showItems) {
        edges {
          node {
            id
            title
            contributors {
              user {
                id
                name
              }
              role {
                id
                name
              }
            }
            ...EventPersonResponsibilityChooser_event
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
});
