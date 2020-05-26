import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Link from "found/Link";
import matchSorter from "match-sorter";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import AddRoleMutation from "../mutations/AddRole";
import LeaveGroupMutation from "../mutations/LeaveGroup";
import RemoveRoleMutation from "../mutations/RemoveRole";
import { GroupSettingsUserItem_member } from "./__generated__/GroupSettingsUserItem_member.graphql";

type RoleOptionType = {
  id: string,
  name: string,
};

type Props = {
  group: {
    id: string,
  },
  isGroupLeader: boolean,
  member: GroupSettingsUserItem_member,
  roles: {
    edges: Array<{
      node: {
        id: string,
        name: string,
      },
    }>,
  },
  relay: RelayProp,
};

type State = {
  addingGroupLeader: {
    id: string,
  } | null,
  menuIsOpen: null | HTMLElement,
};

class GroupSettingsUserItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      addingGroupLeader: null,
      menuIsOpen: null,
    };
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  toggleGroupLeader = (member, isGroupLeader) => {
    const { relay } = this.props;
    if (isGroupLeader) {
      // remove group leader status
      // FIXME: We assume the first role for this group is a group leader
      // role. We also assume that there is a role set when we get
      // isGroupLeader.
      const role = member.roles[0];
      RemoveRoleMutation.commit(
        relay.environment,
        {
          roleId: role.id,
          memberId: member.id,
        },
        undefined,
      );
      this.setState({ menuIsOpen: null });
    } else {
      // add group leader status
      this.setState({ addingGroupLeader: member, menuIsOpen: null });
    }
  };

  closeAddingGroupLeader = () => {
    this.setState({ addingGroupLeader: null, menuIsOpen: null });
  };

  setGroupLeader = (_: any, role: RoleOptionType | null) => {
    if (role) {
      const { addingGroupLeader } = this.state;
      const { relay } = this.props;
      if (addingGroupLeader) {
        AddRoleMutation.commit(
          relay.environment,
          {
            roleId: role.id,
            memberId: addingGroupLeader.id,
          },
          undefined,
        );
      }
    }
    this.setState({ addingGroupLeader: null, menuIsOpen: null });
  };

  leaveGroup = (user, group) => {
    const { relay } = this.props;
    LeaveGroupMutation.commit(
      relay.environment,
      {
        groupId: group.id,
        userId: user.id,
      },
      this.setState({
        menuIsOpen: null,
      }),
    );
  };

  render() {
    const { member, isGroupLeader, roles, group } = this.props;
    const { addingGroupLeader } = this.state;
    const roleOptions: RoleOptionType[] = roles.edges.map((edge) => {
      return { name: edge.node.name, id: edge.node.id };
    });
    return (
      <ListItem>
        <Dialog
          open={!!addingGroupLeader}
          onClose={this.closeAddingGroupLeader}
        >
          <DialogTitle>Sett som gruppeleder</DialogTitle>
          <DialogContent>
            <p>Velg en rolle fra lista under</p>
            <Autocomplete
              options={roleOptions}
              onChange={this.setGroupLeader}
              openOnFocus
              getOptionLabel={(option) => option.name}
              getOptionSelected={(option, value) => option.id === value.id}
              renderInput={(params) => <TextField {...params} label="Rolle" />}
              filterOptions={(options, { inputValue }) =>
                matchSorter(options, inputValue, { keys: ["name"] })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={this.closeAddingGroupLeader}>
              Avbryt
            </Button>
          </DialogActions>
        </Dialog>
        <ListItemText
          primary={member.user.name}
          secondary={member.roles
            .map((role) => {
              return role.name;
            })
            .join(", ")}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={this.onMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={this.state.menuIsOpen}
            onClose={this.onMenuClose}
            open={Boolean(this.state.menuIsOpen)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem component={Link} to={`/users/${member.user.id}`}>
              Gå til brukerside
            </MenuItem>
            <MenuItem
              onClick={(event) => {
                event.preventDefault();
                return this.leaveGroup(member.user, group);
              }}
            >
              Fjern fra gruppe
            </MenuItem>
            <MenuItem
              onClick={() => {
                this.toggleGroupLeader(member, isGroupLeader);
              }}
            >
              <ListItemText primary="Gruppeleder" />
              <ListItemSecondaryAction>
                <Switch
                  edge="end"
                  onChange={() => {
                    this.toggleGroupLeader(member, isGroupLeader);
                  }}
                  checked={isGroupLeader}
                />
              </ListItemSecondaryAction>
            </MenuItem>
          </Menu>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

export default createFragmentContainer(GroupSettingsUserItem, {
  member: graphql`
    fragment GroupSettingsUserItem_member on Member {
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
  `,
});
