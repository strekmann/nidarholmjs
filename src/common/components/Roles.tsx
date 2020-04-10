import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "material-ui/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Delete from "@material-ui/icons/Delete";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import CreateRoleMutation from "../mutations/CreateRole";
import DeleteRoleMutation from "../mutations/DeleteRole";
import theme from "../theme";
import { Roles_organization } from "./__generated__/Roles_organization.graphql";
import { ListItemSecondaryAction } from "@material-ui/core";

type Props = {
  organization: Roles_organization,
  classes: any,
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

  constructor(props: Props) {
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
    const { organization, classes } = this.props;
    const { isAdmin } = organization;
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
        <Dialog open={this.state.creating} onClose={this.onClose}>
          <DialogTitle>Legg til ny rolle</DialogTitle>
          <DialogContent>
            <div>
              <TextField
                label="Rolle"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  this.setState({ name: event.target.value });
                }}
                value={this.state.name}
                required
              />
            </div>
            <div>
              <TextField
                label="E-post"
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  this.setState({ email: event.target.value });
                }}
                value={this.state.email}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" onClick={this.onClose}>
              Avbryt
            </Button>
            <Button variant="contained" onClick={this.onSave} color="primary">
              Lagre
            </Button>
          </DialogActions>
        </Dialog>
        <List>
          {organization.roles.edges.map((edge) => {
            const { id, name, email, users } = edge.node;
            // <a href="" onClick={(event) => { this.onDelete(event, id); }}>Slett</a>
            return [
              <ListItem key={id} style={{ textTransform: "uppercase" }}>
                <ListItemText primary={name} secondary={email} />
                <ListItemSecondaryAction>
                  <IconButton
                    onClick={(event) => {
                      this.onDelete(event, id);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>,
              <List key={`nested${id}`} component="div" disablePadding>
                {users.map((user) => {
                  return (
                    <ListItem key={user.id} className={classes.nested}>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                    </ListItem>
                  );
                })}
              </List>,
            ];
          })}
        </List>
      </Paper>
    );
  }
}

const useStyles = (theme) => {
  return {
    nested: {
      paddingLeft: theme.spacing(8),
    },
  };
};

export default withStyles(useStyles)(
  createFragmentContainer(Roles, {
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
  }),
);
