import Dialog from "material-ui/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import { List, ListItem } from "material-ui/List";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import Delete from "material-ui/svg-icons/action/delete";
import PropTypes from "prop-types";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import CreateRoleMutation from "../mutations/CreateRole";
import DeleteRoleMutation from "../mutations/DeleteRole";
import theme from "../theme";
import { Roles_organization } from "./__generated__/Roles_organization.graphql";

type Props = {
  organization: Roles_organization,
  relay: RelayProp,
};

type State = {
  creating: boolean,
  name: string,
  email: string,
  menuIsOpen: null | HTMLElement,
};

class Roles extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    creating: false,
    name: "",
    email: "",
    menuIsOpen: null,
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  onClose = () => {
    this.setState({ creating: false });
  };

  onDelete = (event, id) => {
    event.preventDefault();
    DeleteRoleMutation.commit(
      this.props.relay.environment,
      {
        id,
      },
      undefined,
    );
  };

  onSave = (event) => {
    event.preventDefault();
    this.setState({ creating: false });
    const { name, email } = this.state;
    CreateRoleMutation.commit(
      this.props.relay.environment,
      {
        name,
        email,
      },
      () => {
        this.setState({
          name: "",
          email: "",
        });
      },
    );
  };

  render() {
    const { organization } = this.props;
    const { isAdmin } = organization;
    const actions = [
      <RaisedButton label="Avbryt" onClick={this.onClose} />,
      <RaisedButton label="Lagre" onClick={this.onSave} primary />,
    ];
    return (
      <Paper className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Verv og roller</h1>
          {isAdmin ? (
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
                    this.setState({ creating: true });
                  }}
                >
                  Legg til ny rolle
                </MenuItem>
              </Menu>
            </div>
          ) : null}
        </div>
        <Dialog
          open={this.state.creating}
          title="Legg til ny rolle"
          onRequestClose={this.onClose}
          actions={actions}
        >
          <div>
            <TextField
              floatingLabelText="Rolle"
              onChange={(_, name) => {
                this.setState({ name });
              }}
              value={this.state.name}
              required
            />
          </div>
          <div>
            <TextField
              floatingLabelText="E-post-alias"
              onChange={(_, email) => {
                this.setState({ email });
              }}
              value={this.state.email}
            />
          </div>
        </Dialog>
        <List>
          {organization.roles.edges.map((edge) => {
            const { id, name, email, users } = edge.node;
            // <a href="" onClick={(event) => { this.onDelete(event, id); }}>Slett</a>
            return (
              <ListItem
                key={id}
                primaryText={name}
                secondaryText={email}
                style={{ textTransform: "uppercase" }}
                disabled
                initiallyOpen
                rightIconButton={
                  <IconButton
                    onClick={(event) => {
                      this.onDelete(event, id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                }
                nestedItems={users.map((user) => {
                  return (
                    <ListItem
                      key={user.id}
                      primaryText={user.name}
                      secondaryText={user.email}
                      disabled
                      insetChildren
                    />
                  );
                })}
              />
            );
          })}
        </List>
      </Paper>
    );
  }
}

export default createFragmentContainer(Roles, {
  organization: graphql`
    fragment Roles_organization on Organization {
      isAdmin
      roles(first: 100) {
        edges {
          node {
            id
            name
            email
            users {
              id
              name
              email
            }
          }
        }
      }
    }
  `,
});
