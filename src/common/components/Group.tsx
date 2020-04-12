import Link from "found/Link";
import AutoComplete from "material-ui/AutoComplete";
import Dialog from "@material-ui/core/Dialog";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { RelayProp } from "react-relay";

import theme from "../theme";
import JoinGroupMutation from "../mutations/JoinGroup";
import SaveGroupMutation from "../mutations/SaveGroup";

import GroupSettingsUserItem from "./GroupSettingsUserItem";

import { Group_organization } from "./__generated__/Group_organization.graphql";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";

type Props = {
  organization: Group_organization,
  relay: RelayProp,
};

type State = {
  joinGroup: boolean,
  addingGroupLeader: {
    id: string,
  } | null,
  editing: boolean,
  email: string,
  groupLeaderEmail: string,
  menuIsOpen: null | HTMLElement,
};

class Group extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
    const { organization } = this.props;
    this.state = {
      joinGroup: false,
      addingGroupLeader: null,
      editing: false,
      email: organization.group?.email || "",
      groupLeaderEmail: organization.group?.groupLeaderEmail || "",
      menuIsOpen: null,
    };
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  onSave = (event) => {
    event.preventDefault();
    this.setState({ editing: false });
    const { relay, organization } = this.props;
    const { email, groupLeaderEmail } = this.state;
    if (organization.group) {
      SaveGroupMutation.commit(
        relay.environment,
        {
          groupId: organization.group.id,
          email,
          groupLeaderEmail,
        },
        undefined,
      );
    }
  };

  muiTheme: {};

  joinGroup = (selection) => {
    this.setState({ joinGroup: false });
    const { organization, relay } = this.props;
    if (organization.group) {
      JoinGroupMutation.commit(
        relay.environment,
        {
          groupId: organization.group.id,
          userId: selection.value.id,
        },
        undefined,
      );
    }
  };

  closeJoinGroup = () => {
    this.setState({ joinGroup: false });
  };

  closeEditing = () => {
    this.setState({ editing: false });
  };

  render() {
    const { organization } = this.props;
    const { group, isAdmin, roles, instrumentGroups } = organization;
    const { joinGroup, editing, email, groupLeaderEmail } = this.state;
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
            <Dialog title="" open={joinGroup} onClose={this.closeJoinGroup}>
              <DialogTitle>Legg til gruppemedlem</DialogTitle>
              <DialogContent>
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
              </DialogContent>
              <DialogActions>
                <Button variant="text" onClick={this.closeJoinGroup}>
                  Avbryt
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog open={editing} onClose={this.closeEditing}>
              <DialogTitle>Epostinnstillinger</DialogTitle>
              <DialogContent>
                <div>
                  <TextField
                    floatingLabelText="Epost til liste"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ email: event.target.value });
                    }}
                    value={email}
                  />
                </div>
                {instrumentGroups.some((g) => {
                  return group.id === g.id;
                }) ? (
                  <div>
                    <TextField
                      floatingLabelText="Epostalias til gruppeleder"
                      onChange={(event, _groupLeaderEmail) => {
                        this.setState({ groupLeaderEmail: _groupLeaderEmail });
                      }}
                      value={groupLeaderEmail}
                    />
                  </div>
                ) : null}
              </DialogContent>
              <DialogActions>
                <Button onClick={this.closeEditing}>Avbryt</Button>
                <Button color="primary" onClick={this.onSave}>
                  Lagre
                </Button>
              </DialogActions>
            </Dialog>
            <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
              <div>
                <Link to="/groups">Alle grupper</Link>
              </div>
              <div>
                <IconButton onClick={this.onMenuOpen}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={this.state.menuIsOpen}
                  onClose={this.onMenuClose}
                  open={Boolean(this.state.menuIsOpen)}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    onClick={() => {
                      this.setState({ joinGroup: !joinGroup });
                    }}
                  >
                    Legg til gruppemedlem
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      this.setState({ editing: true });
                    }}
                  >
                    Epostinnstillinger
                  </MenuItem>
                </Menu>
              </div>
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
                    <GroupSettingsUserItem
                      key={member.id}
                      member={member}
                      isGroupLeader={isGroupLeader}
                      roles={roles}
                      group={group}
                    />
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
            name
          }
          ...GroupSettingsUserItem_member
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
