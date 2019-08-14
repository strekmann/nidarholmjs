/* @flow */

import Link from "found/lib/Link";
import AutoComplete from "material-ui/AutoComplete";
import Dialog from "material-ui/Dialog";
import Divider from "material-ui/Divider";
import FlatButton from "material-ui/FlatButton";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import { List, ListItem } from "material-ui/List";
import MenuItem from "material-ui/MenuItem";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";
import AddRoleMutation from "../mutations/AddRole";
import JoinGroupMutation from "../mutations/JoinGroup";
import LeaveGroupMutation from "../mutations/LeaveGroup";
import RemoveRoleMutation from "../mutations/RemoveRole";
import SaveGroupMutation from "../mutations/SaveGroup";

type Props = {
  organization: {
    group: {
      id: string,
      email: string,
      members: [
        {
          id: string,
          roles: [
            {
              id: string,
              name: string,
            },
          ],
          user: {
            id: string,
            name: string,
          },
        },
      ],
      name: string,
      groupLeaderEmail: string,
    },
    instrumentGroups: [
      {
        id: string,
      },
    ],
    isAdmin: boolean,
    roles: {
      edges: [
        {
          node: {
            id: string,
            name: string,
          },
        },
      ],
    },
    users: [
      {
        id: string,
        name: string,
        username: string,
      },
    ],
  },
  relay: {
    environment: {},
  },
};

type State = {
  joinGroup: boolean,
  addingGroupLeader: {
    id: string,
  } | null,
  editing: boolean,
  email: string,
  groupLeaderEmail: string,
};

class Group extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    joinGroup: false,
    addingGroupLeader: null,
    editing: false,
    email: this.props.organization.group.email || "",
    groupLeaderEmail: this.props.organization.group.groupLeaderEmail || "",
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onSave = (event) => {
    event.preventDefault();
    this.setState({ editing: false });
    SaveGroupMutation.commit(this.props.relay.environment, {
      groupId: this.props.organization.group.id,
      email: this.state.email,
      groupLeaderEmail: this.state.groupLeaderEmail,
    });
  };

  setGroupLeader = (role) => {
    if (this.state.addingGroupLeader) {
      AddRoleMutation.commit(this.props.relay.environment, {
        roleId: role.value,
        memberId: this.state.addingGroupLeader.id,
      });
    }
    this.setState({ addingGroupLeader: null });
  };

  muiTheme: {};

  joinGroup = (selection) => {
    this.setState({ joinGroup: false });
    JoinGroupMutation.commit(this.props.relay.environment, {
      groupId: this.props.organization.group.id,
      userId: selection.value.id,
    });
  };

  leaveGroup = (user, group) => {
    LeaveGroupMutation.commit(this.props.relay.environment, {
      groupId: group.id,
      userId: user.id,
    });
  };

  closeJoinGroup = () => {
    this.setState({ joinGroup: false });
  };

  toggleGroupLeader = (member, isGroupLeader) => {
    if (isGroupLeader) {
      // remove group leader status
      // FIXME: We assume the first role for this group is a group leader
      // role. We also assume that there is a role set when we get
      // isGroupLeader.
      const role = member.roles[0];
      RemoveRoleMutation.commit(this.props.relay.environment, {
        roleId: role.id,
        memberId: member.id,
      });
    } else {
      // add group leader status
      this.setState({ addingGroupLeader: member });
    }
  };

  closeAddingGroupLeader = () => {
    this.setState({ addingGroupLeader: null });
  };

  closeEditing = () => {
    this.setState({ editing: false });
  };

  render() {
    const { organization } = this.props;
    const { group, isAdmin, roles, instrumentGroups } = organization;
    const members = group.members.filter((member) => {
      return member.user;
    });
    members.sort((a, b) => {
      if (a.user.name > b.user.name) {
        return 1;
      }
      return -1;
    });
    return (
      <section>
        {isAdmin ? (
          <Paper className="row">
            <Dialog
              title="Legg til gruppemedlem"
              open={this.state.joinGroup}
              onRequestClose={this.closeJoinGroup}
              autoScrollBodyContent
              actions={
                <FlatButton label="Avbryt" onClick={this.closeJoinGroup} />
              }
            >
              <AutoComplete
                dataSource={organization.users.map((user) => {
                  return {
                    text: `${user.name} (${user.username})`,
                    value: user,
                  };
                })}
                floatingLabelText="Navn"
                onNewRequest={this.joinGroup}
                filter={AutoComplete.fuzzyFilter}
                fullWidth
              />
            </Dialog>
            <Dialog
              title="Epostinnstillinger"
              open={this.state.editing}
              onRequestClose={this.closeEditing}
              autoScrollBodyContent
              actions={[
                <FlatButton label="Avbryt" onClick={this.closeEditing} />,
                <FlatButton label="Lagre" primary onClick={this.onSave} />,
              ]}
            >
              <div>
                <TextField
                  floatingLabelText="Epost til liste"
                  onChange={(event, email) => {
                    this.setState({ email });
                  }}
                  value={this.state.email}
                />
              </div>
              {instrumentGroups.some((g) => {
                return group.id === g.id;
              }) ? (
                <div>
                  <TextField
                    floatingLabelText="Epostalias til gruppeleder"
                    onChange={(event, groupLeaderEmail) => {
                      this.setState({ groupLeaderEmail });
                    }}
                    value={this.state.groupLeaderEmail}
                  />
                </div>
              ) : null}
            </Dialog>
            <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
              <ToolbarGroup firstChild>
                <Link to="/groups">Alle grupper</Link>
              </ToolbarGroup>
              <ToolbarGroup lastChild>
                <IconMenu
                  iconButtonElement={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  targetOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    primaryText="Legg til gruppemedlem"
                    onClick={() => {
                      this.setState({ joinGroup: !this.state.joinGroup });
                    }}
                  />
                  <MenuItem
                    primaryText="Epostinnstillinger"
                    onClick={() => {
                      this.setState({ editing: true });
                    }}
                  />
                </IconMenu>
              </ToolbarGroup>
            </Toolbar>
            <div>
              <h1>{group.name}</h1>
              {group.email ? (
                <p>
                  Epost til liste:{" "}
                  <a href={`mailto:${group.email}`}>{group.email}</a>
                </p>
              ) : null}
              {group.groupLeaderEmail ? (
                <p>
                  Epost til gruppeleder{" "}
                  <a href={`mailto:${group.groupLeaderEmail}`}>
                    {group.groupLeaderEmail}
                  </a>
                </p>
              ) : null}
              <List>
                <Divider />
                {members.map((member) => {
                  const isGroupLeader = member.roles.some((role) => {
                    return !!role.name;
                  });
                  return (
                    <div key={member.id}>
                      <Dialog
                        title="Sett som gruppeleder"
                        open={!!this.state.addingGroupLeader}
                        onRequestClose={this.closeAddingGroupLeader}
                      >
                        <p>Velg en rolle fra lista under</p>
                        <AutoComplete
                          dataSource={roles.edges.map((edge) => {
                            return {
                              text: edge.node.name,
                              value: edge.node.id,
                            };
                          })}
                          floatingLabelText="Rolle"
                          onNewRequest={this.setGroupLeader}
                          openOnFocus
                          filter={AutoComplete.fuzzyFilter}
                          fullWidth
                        />
                      </Dialog>
                      <ListItem
                        disabled
                        primaryText={member.user.name}
                        secondaryText={member.roles
                          .map((role) => {
                            return role.name;
                          })
                          .join(", ")}
                        rightIconButton={
                          <IconMenu
                            iconButtonElement={
                              <IconButton>
                                <MoreVertIcon />
                              </IconButton>
                            }
                            anchorOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                            targetOrigin={{
                              vertical: "top",
                              horizontal: "right",
                            }}
                          >
                            <MenuItem
                              primaryText="Gå til brukerside"
                              insetChildren
                              containerElement={
                                <Link to={`/users/${member.user.id}`} />
                              }
                            />
                            <MenuItem
                              primaryText="Fjern fra gruppe"
                              insetChildren
                              onClick={(event) => {
                                event.preventDefault();
                                return this.leaveGroup(member.user, group);
                              }}
                            />
                            <MenuItem
                              primaryText="Gruppeleder"
                              checked={isGroupLeader}
                              insetChildren
                              onClick={() => {
                                this.toggleGroupLeader(member, isGroupLeader);
                              }}
                            />
                          </IconMenu>
                        }
                      />
                    </div>
                  );
                })}
              </List>
            </div>
          </Paper>
        ) : null}
      </section>
    );
  }
}

export default createFragmentContainer(Group, {
  organization: graphql`
    fragment Group_organization on Organization {
      isAdmin
      users {
        id
        name
        username
      }
      group(groupId: $groupId) {
        id
        name
        email
        groupLeaderEmail
        members {
          id
          user(active: true) {
            id
            name
          }
          roles {
            id
            name
          }
        }
        externallyHidden
      }
      instrumentGroups {
        id
      }
      roles(first: 100) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
  viewer: graphql`
    fragment Group_viewer on User {
      id
    }
  `,
});
