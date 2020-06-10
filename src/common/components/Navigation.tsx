/* eslint "react/require-default-props": 0 */

import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import common from "@material-ui/core/colors/common";
import indigo from "@material-ui/core/colors/indigo";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Popover from "@material-ui/core/Popover";
import withStyles from "@material-ui/core/styles/withStyles";
import LockOpen from "@material-ui/icons/LockOpen";
import NavigationMenu from "@material-ui/icons/Menu";
import Person from "@material-ui/icons/Person";
import Link from "found/Link";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { Navigation_organization } from "./__generated__/Navigation_organization.graphql";
import { Navigation_viewer } from "./__generated__/Navigation_viewer.graphql";

type Props = {
  classes: any;
  organization: Navigation_organization;
  viewer: Navigation_viewer;
};

type State = {
  open: boolean;
  anchorEl?: any;
};

class Navigation extends React.Component<Props, State> {
  state = {
    open: false,
    anchorEl: null,
  };

  handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  renderAvatar = () => {
    const { viewer } = this.props;
    if (viewer.profilePicture) {
      return (
        <Avatar
          src={viewer.profilePicture.thumbnailPath || undefined}
          style={{ margin: "0 5px" }}
          alt={viewer.name}
        />
      );
    }
    return (
      <Avatar style={{ margin: "0 5px" }} alt={viewer.name}>
        <Person />
      </Avatar>
    );
  };

  render() {
    const { classes, organization, viewer } = this.props;
    const { open, anchorEl } = this.state;
    const { isMember } = organization;
    const logo = (
      <Link
        to="/"
        onClick={this.handleClose}
        style={{
          padding: "19px 10px 20px 9px",
        }}
      >
        <img
          src="/img/logo.wh.svg"
          alt="Forsida"
          style={{
            height: 75,
            width: 196,
            paddingTop: 4,
            marginBottom: -18,
          }}
        />
      </Link>
    );
    return (
      <div style={{ backgroundColor: indigo[900] }}>
        <div className="flex-menu-desktop">
          <nav
            className="flex-menu"
            style={{
              display: "flex",
              flexWrap: "wrap",
              minWidth: 300,
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <div style={{ flexBasis: "auto" }}>{logo}</div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                flexGrow: 1,
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Link to="/om">Om oss</Link>
              <Link to="/projects">Prosjekter</Link>
              <Link to="/members">Medlemmer</Link>
              <Link to="/stott-oss">Støtt oss</Link>
              <Link to="/contact">Kontakt</Link>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                flexGrow: 1,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              {isMember ? <Link to="/files">Filer</Link> : null}
              {isMember ? <Link to="/pages">Sider</Link> : null}
              {isMember ? <Link to="/events">Aktiviteter</Link> : null}
              {isMember ? <Link to="/music">Notearkiv</Link> : null}
              {viewer ? (
                <Link
                  to={`/users/${viewer.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "-5px 0",
                    color: common.white,
                  }}
                >
                  {this.renderAvatar()}
                  <span>{viewer.name}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  style={{
                    padding: 0,
                    margin: "12px 15px 12px 10px",
                  }}
                >
                  <Button
                    variant="contained"
                    startIcon={<LockOpen />}
                    className={classes.loginButton}
                  >
                    Logg inn
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
        <nav className="flex-menu-mobile">
          <div style={{ flexGrow: 1 }}>{logo}</div>
          <div>
            {viewer ? (
              <Link to={`/users/${viewer.id}`} className="avatar-container">
                {this.renderAvatar()}
              </Link>
            ) : (
              <Link to="/login">
                <IconButton
                  disableFocusRipple
                  style={{ minWidth: 44, marginLeft: 10 }}
                  className={classes.loginButton}
                  color="inherit"
                >
                  <LockOpen />
                </IconButton>
              </Link>
            )}
          </div>
          <div>
            <IconButton
              className="flex-menu-handler main-menu-mobile"
              onClick={this.handleOpen}
            >
              <NavigationMenu style={{ color: common.white }} />
            </IconButton>
            <Popover
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              onClose={this.handleClose}
            >
              <nav
                className="flex-menu"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "space-around",
                  width: "100%",
                  backgroundColor: indigo[900],
                }}
              >
                <div>
                  <MenuItem>
                    <Link to="/om" onClick={this.handleClose}>
                      Om oss
                    </Link>
                  </MenuItem>
                  <MenuItem className="projects">
                    <Link to="/projects" onClick={this.handleClose}>
                      Prosjekter
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to="/members" onClick={this.handleClose}>
                      Medlemmer
                    </Link>
                  </MenuItem>
                  <MenuItem>
                    <Link to="/stott-oss" onClick={this.handleClose}>
                      Støtt oss
                    </Link>
                  </MenuItem>
                  <MenuItem className="contact">
                    <Link to="/contact" onClick={this.handleClose}>
                      Kontakt
                    </Link>
                  </MenuItem>
                </div>
                {isMember ? (
                  <div>
                    {isMember ? (
                      <MenuItem>
                        <Link to="/files" onClick={this.handleClose}>
                          Filer
                        </Link>
                      </MenuItem>
                    ) : null}
                    {isMember ? (
                      <MenuItem>
                        <Link to="/pages" onClick={this.handleClose}>
                          Sider
                        </Link>
                      </MenuItem>
                    ) : null}
                    {isMember ? (
                      <MenuItem>
                        <Link to="/events" onClick={this.handleClose}>
                          Aktiviteter
                        </Link>
                      </MenuItem>
                    ) : null}
                    {isMember ? (
                      <MenuItem>
                        <Link to="/music" onClick={this.handleClose}>
                          Notearkiv
                        </Link>
                      </MenuItem>
                    ) : null}
                  </div>
                ) : null}
              </nav>
            </Popover>
          </div>
        </nav>
      </div>
    );
  }
}

const styles = {
  loginButton: {
    backgroundColor: common.white,
  },
};

export default withStyles(styles)(
  createFragmentContainer(Navigation, {
    viewer: graphql`
      fragment Navigation_viewer on User {
        id
        name
        profilePicture {
          thumbnailPath
        }
      }
    `,
    organization: graphql`
      fragment Navigation_organization on Organization {
        id
        isMember
      }
    `,
  }),
);
