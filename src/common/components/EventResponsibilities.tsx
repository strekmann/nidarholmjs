import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import PropTypes from "prop-types";

import theme from "../theme";

import EventGroupResponsibilityChooser from "./EventGroupResponsibilityChooser";
import EventPersonResponsibilityChooser from "./EventPersonResponsibilityChooser";
import Daterange from "./Daterange";
import { EventResponsibilities_organization } from "./__generated__/EventResponsibilities_organization.graphql";

type Props = {
  organization: EventResponsibilities_organization,
};

type State = {
  instrumentGroups: Array<{ id: string, name: string }>,
  users: Array<{ id: string, name: string }>,
};

class EventResponsibilities extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props: Props) {
    super(props);
    const { organization } = props;
    // TODO: User different lists per responsibility instead of common
    let { instrumentGroups } = organization;
    if (organization.organizationEventGroupResponsibilities.length) {
      instrumentGroups = this.orderGroups(
        instrumentGroups,
        organization.organizationEventGroupResponsibilities[0].last,
      );
    }
    let users = this.flattenMemberList(organization.instrumentGroups);
    if (organization.organizationEventPersonResponsibilities.length) {
      users = this.orderUsers(
        users,
        organization.organizationEventPersonResponsibilities[0].last,
      );
    }
    this.state = {
      instrumentGroups,
      users,
    };
  }

  getChildContext() {
    return { muiTheme: getMuiTheme(theme) };
  }

  orderGroups = (groups, lastGroup) => {
    if (!lastGroup) {
      return groups;
    }
    const lastIndex = groups.findIndex((group) => {
      return group.id === lastGroup.id;
    });
    if (lastIndex < 0) {
      return groups;
    }
    return groups
      .slice(lastIndex + 1, groups.length)
      .concat(groups.slice(0, lastIndex + 1));
  };

  orderUsers = (users, lastUser) => {
    if (!lastUser) {
      return users;
    }
    const lastIndex = users.findIndex((user) => {
      return user.id === lastUser.id;
    });
    if (lastIndex < 0) {
      return users;
    }
    const data = users
      .slice(lastIndex + 1, users.length)
      .concat(users.slice(0, lastIndex + 1));
    return data;
  };

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

  setGroupOrder = (group) => {
    const { organization } = this.props;
    const newGroupList = this.orderGroups(organization.instrumentGroups, group);
    this.setState({
      instrumentGroups: newGroupList,
    });
  };

  setUserOrder = (user) => {
    const { users } = this.state;
    const newUserList = this.orderUsers(users, user);
    this.setState({
      users: newUserList,
    });
  };

  render() {
    const { organization } = this.props;
    const {
      events,
      organizationEventPersonResponsibilities,
      organizationEventGroupResponsibilities,
    } = organization;
    const { instrumentGroups } = this.state;
    const { users } = this.state;
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {organizationEventPersonResponsibilities.map((responsibility) => {
              return (
                <TableCell key={responsibility.id}>
                  {responsibility.name}
                </TableCell>
              );
            })}
            {organizationEventGroupResponsibilities.map((responsibility) => {
              return (
                <TableCell key={responsibility.id}>
                  {responsibility.name}
                </TableCell>
              );
            })}
          </TableRow>
        </TableHead>
        <TableBody>
          {events.edges.map((edge) => {
            return (
              <TableRow key={edge.node.id}>
                <TableCell style={{ verticalAlign: "top" }}>
                  <h2>{edge.node.title}</h2>
                  <div className="meta">
                    <Daterange start={edge.node.start} end={edge.node.end} />{" "}
                    {edge.node.location}
                  </div>
                  <div>{edge.node.text}</div>
                </TableCell>
                {organizationEventPersonResponsibilities.map(
                  (responsibility) => {
                    return (
                      <TableCell
                        style={{ verticalAlign: "top" }}
                        key={`${edge.node.id}-${responsibility.id}`}
                      >
                        <EventPersonResponsibilityChooser
                          organizationEventPersonResponsibility={responsibility}
                          users={users}
                          event={edge.node}
                          selectUser={this.setUserOrder}
                        />
                      </TableCell>
                    );
                  },
                )}
                {organizationEventGroupResponsibilities.map(
                  (responsibility) => {
                    return (
                      <TableCell
                        style={{ verticalAlign: "top" }}
                        key={`${edge.node.id}-${responsibility.id}`}
                      >
                        <EventGroupResponsibilityChooser
                          organizationEventGroupResponsibility={responsibility}
                          groups={instrumentGroups}
                          event={edge.node}
                          selectGroup={this.setGroupOrder}
                        />
                      </TableCell>
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

export default createFragmentContainer(EventResponsibilities, {
  organization: graphql`
    fragment EventResponsibilities_organization on Organization
      @argumentDefinitions(showItems: { type: "Int", defaultValue: 20 }) {
      organizationEventGroupResponsibilities {
        id
        name
        last {
          id
          name
        }
        ...EventGroupResponsibilityChooser_organizationEventGroupResponsibility
      }
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
        id
        name
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
            text
            location
            start
            end
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
            ...EventGroupResponsibilityChooser_event
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
});
