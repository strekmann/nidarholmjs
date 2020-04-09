/* eslint "max-len": 0 */

import areIntlLocalesSupported from "intl-locales-supported";
import AutoComplete from "material-ui/AutoComplete";
import Checkbox from "material-ui/Checkbox";
import DatePicker from "material-ui/DatePicker";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import Paper from "material-ui/Paper";
import TextField from "material-ui/TextField";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { lightBlue100 } from "material-ui/styles/colors";
import Close from "@material-ui/icons/Close";
import moment from "moment";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { RelayProp } from "react-relay";
import Link from "found/Link";

import theme from "../theme";
import EditUserMutation from "../mutations/EditUser";
import JoinGroupMutation from "../mutations/JoinGroup";
import LeaveGroupMutation from "../mutations/LeaveGroup";
import AddRoleMutation from "../mutations/AddRole";
import RemoveRoleMutation from "../mutations/RemoveRole";

import Text from "./Text";
import Phone from "./Phone";
import Date from "./Date";
import DateFromNow from "./DateFromNow";
import ProfilePicture from "./ProfilePicture";
import Yesno from "./Yesno";
import { Member_organization } from "./__generated__/Member_organization.graphql";
import { Member_viewer } from "./__generated__/Member_viewer.graphql";
import ListItemText from "@material-ui/core/ListItemText";

let DateTimeFormat;
if (areIntlLocalesSupported(["nb"])) {
  ({ DateTimeFormat } = global.Intl);
}

type Props = {
  organization: Member_organization,
  relay: RelayProp,
  viewer: Member_viewer,
};

type State = {
  name: string,
  username: string,
  phone: string,
  email: string,
  instrument: string,
  born?: string,
  address: string,
  postcode: string,
  city: string,
  country: string,
  joined?: string,
  nmfId: string,
  membershipHistory: string,
  inList: boolean,
  onLeave: boolean,
  noEmail: boolean,
  addingRole: boolean,
  editMember: boolean,
  joinGroup: boolean,
  menuIsOpen: null | HTMLElement,
};

class Member extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
    let member;
    let user;
    const { organization } = this.props;
    this.state = {
      name: "",
      username: "",
      phone: "",
      email: "",
      instrument: "",
      born: null,
      address: "",
      postcode: "",
      city: "",
      country: "",
      joined: null,
      nmfId: "",
      membershipHistory: "",
      inList: true,
      onLeave: false,
      noEmail: false,
      addingRole: false,
      editMember: false,
      joinGroup: false,
      menuIsOpen: null,
    };
    if (organization) {
      ({ member } = organization);
      if (member) {
        ({ user } = member);
        if (user) {
          const {
            name,
            username,
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
            membershipHistory,
            inList,
            onLeave,
            noEmail,
          } = user;
          this.state = {
            name: name || "",
            username: username || "",
            phone: phone || "",
            email: email || "",
            instrument: instrument || "",
            born: born ? moment(born).toDate() : null,
            address: address || "",
            postcode: postcode || "",
            city: city || "",
            country: country || "",
            joined: joined ? moment(joined).toDate() : null,
            nmfId: nmfId || "",
            membershipHistory: membershipHistory || "",
            inList: !!inList,
            onLeave: !!onLeave,
            noEmail: !!noEmail,
            addingRole: false,
            editMember: false,
            joinGroup: false,
            menuIsOpen: null,
          };
        }
      }
    }
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onChangeName = (event, name) => {
    this.setState({ name });
  };
  onChangePhone = (event, phone) => {
    this.setState({ phone });
  };
  onChangeEmail = (event, email) => {
    this.setState({ email });
  };
  onChangeInstrument = (event, instrument) => {
    this.setState({ instrument });
  };
  onChangeAddress = (event, address) => {
    this.setState({ address });
  };
  onChangePostcode = (event, postcode) => {
    this.setState({ postcode });
  };
  onChangeCity = (event, city) => {
    this.setState({ city });
  };
  onChangeCountry = (event, country) => {
    this.setState({ country });
  };
  onChangeMembershipHistory = (event, membershipHistory) => {
    this.setState({ membershipHistory });
  };
  onChangeJoined = (event, joined) => {
    this.setState({ joined });
  };
  onChangeBorn = (event, born) => {
    this.setState({ born });
  };
  onChangeInList = (event, inList) => {
    this.setState({ inList });
  };
  onChangeOnLeave = (event, onLeave) => {
    this.setState({ onLeave });
  };
  onChangeNoEmail = (event, noEmail) => {
    this.setState({ noEmail });
  };

  muiTheme: {};

  saveMember = (event) => {
    event.preventDefault();
    const { relay } = this.props;
    const data = {
      userId:
        this.props.organization &&
        this.props.organization.member &&
        this.props.organization.member.user &&
        this.props.organization.member.user.id
          ? this.props.organization.member.user.id
          : null,
      username: this.state.username,
      name: this.state.name,
      phone: this.state.phone,
      email: this.state.email,
      instrument: this.state.instrument,
      born: this.state.born,
      address: this.state.address,
      postcode: this.state.postcode,
      city: this.state.city,
      country: this.state.country,
      joined: undefined,
      nmfId: undefined,
      membershipHistory: undefined,
      inList: undefined,
      onLeave: undefined,
      noEmail: undefined,
    };
    if (this.props.organization.isAdmin) {
      data.joined = this.state.joined;
      data.nmfId = this.state.nmfId;
      data.membershipHistory = this.state.membershipHistory;
      data.inList = this.state.inList;
      data.onLeave = this.state.onLeave;
      data.noEmail = this.state.noEmail;
    }
    EditUserMutation.commit(relay.environment, data, () => {
      this.setState({
        editMember: false,
      });
    });
  };
  closeEditMember = () => {
    this.setState({
      editMember: false,
    });
  };
  openEditMember = () => {
    this.setState({
      editMember: true,
    });
  };
  addRole = (roleId) => {
    this.setState({ addingRole: false, menuIsOpen: null });
    if (this.props.organization.member) {
      AddRoleMutation.commit(
        this.props.relay.environment,
        {
          roleId,
          memberId: this.props.organization.member.id,
        },
        undefined,
      );
    }
  };
  removeRole = (roleId) => {
    if (this.props.organization.member) {
      RemoveRoleMutation.commit(
        this.props.relay.environment,
        {
          roleId,
          memberId: this.props.organization.member.id,
        },
        undefined,
      );
    }
  };
  joinGroup = (selection) => {
    this.setState({ joinGroup: false, menuIsOpen: null });
    if (this.props.organization.member && this.props.organization.member.user) {
      JoinGroupMutation.commit(
        this.props.relay.environment,
        {
          groupId: selection.value.id,
          userId: this.props.organization.member.user.id,
        },
        undefined,
      );
    }
  };
  leaveGroup = (user, group) => {
    if (user && group) {
      LeaveGroupMutation.commit(
        this.props.relay.environment,
        {
          groupId: group.id,
          userId: user.id,
        },
        undefined,
      );
    }
  };
  closeJoinGroup = () => {
    this.setState({ joinGroup: false });
  };

  closeAddingRole = () => {
    this.setState({ addingRole: false });
  };

  render() {
    const { organization, viewer } = this.props;
    const { groups, isAdmin, member, roles } = organization;
    if (!member) {
      throw new Error("Member not defined");
    }
    const { user } = member;
    if (!user) {
      throw new Error("User not defined in member");
    }
    const { desktopGutterLess } = theme.spacing;
    if (this.state.editMember) {
      return (
        <Paper className="row">
          <form onSubmit={this.saveMember}>
            <div>
              <TextField
                id="name"
                floatingLabelText="Navn"
                onChange={this.onChangeName}
                value={this.state.name}
              />
            </div>
            <div>
              <TextField
                id="phone"
                floatingLabelText="Telefon"
                onChange={this.onChangePhone}
                value={this.state.phone}
              />
            </div>
            <div>
              <TextField
                id="email"
                floatingLabelText="E-post"
                onChange={this.onChangeEmail}
                value={this.state.email}
              />
            </div>
            <div>
              <TextField
                id="instrument"
                floatingLabelText="Instrument"
                onChange={this.onChangeInstrument}
                value={this.state.instrument}
              />
            </div>
            <div>
              <DatePicker
                id="born"
                floatingLabelText="Fødselsdato"
                onChange={this.onChangeBorn}
                value={this.state.born}
                mode="landscape"
                locale="nb"
                DateTimeFormat={DateTimeFormat}
              />
            </div>
            <div>
              <TextField
                id="address"
                floatingLabelText="Adresse"
                onChange={this.onChangeAddress}
                value={this.state.address}
              />
            </div>
            <div>
              <TextField
                id="postcode"
                floatingLabelText="Postnummer"
                onChange={this.onChangePostcode}
                value={this.state.postcode}
              />
            </div>
            <div>
              <TextField
                id="city"
                floatingLabelText="Sted"
                onChange={this.onChangeCity}
                value={this.state.city}
              />
            </div>
            <div>
              <TextField
                id="country"
                floatingLabelText="Land"
                onChange={this.onChangeCountry}
                value={this.state.country}
              />
            </div>
            {isAdmin ? (
              <div>
                <div>
                  <TextField
                    id="nmfId"
                    floatingLabelText="NMF-nummer"
                    value={this.state.nmfId}
                  />
                </div>
                <div>
                  <DatePicker
                    id="joined"
                    floatingLabelText="Startet i korpset"
                    onChange={this.onChangeJoined}
                    value={this.state.joined}
                    mode="landscape"
                    locale="nb"
                    DateTimeFormat={DateTimeFormat}
                  />
                </div>
                <div>
                  <TextField
                    id="membershipHistory"
                    floatingLabelText="Medlemskapshistorikk"
                    onChange={this.onChangeMembershipHistory}
                    value={this.state.membershipHistory}
                    multiLine
                    fullWidth
                  />
                </div>
                <div>
                  <Checkbox
                    id="inList"
                    label="Synlig i medlemslista"
                    onCheck={this.onChangeInList}
                    checked={this.state.inList}
                  />
                </div>
                <div>
                  <Checkbox
                    id="onLeave"
                    label="Har permisjon"
                    onCheck={this.onChangeOnLeave}
                    checked={this.state.onLeave}
                  />
                </div>
                <div>
                  <Checkbox
                    id="noEmail"
                    label="Ikke epost"
                    onCheck={this.onChangeNoEmail}
                    checked={this.state.noEmail}
                  />
                </div>
              </div>
            ) : null}
            <div>
              <Button variant="contained" type="submit" color="primary">
                Lagre
              </Button>
            </div>
          </form>
        </Paper>
      );
    }
    return (
      <Paper className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>{user.name}</h1>
          {isAdmin && groups ? (
            <Dialog open={this.state.joinGroup} onClose={this.closeJoinGroup}>
              <DialogTitle>Legg til i gruppe</DialogTitle>
              <DialogContent>
                <AutoComplete
                  dataSource={groups.map((group) => {
                    return {
                      text: `${group && group.name ? group.name : ""}`,
                      value: group,
                    };
                  })}
                  floatingLabelText="Gruppe"
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
          ) : null}
          {isAdmin && roles && roles.edges ? (
            <Dialog open={this.state.addingRole} onClose={this.closeAddingRole}>
              <DialogTitle>Legg til verv</DialogTitle>
              <DialogContent>
                <List>
                  {roles.edges.map((edge) => {
                    if (edge && edge.node) {
                      return (
                        <ListItem
                          key={edge.node.id}
                          onClick={() => {
                            if (edge && edge.node) {
                              this.addRole(edge.node.id);
                            }
                          }}
                        >
                          {edge.node.name}
                        </ListItem>
                      );
                    }
                    return null;
                  })}
                </List>
              </DialogContent>
              <DialogActions>
                <Button variant="text" onClick={this.closeAddingRole}>
                  Avbryt
                </Button>
              </DialogActions>
            </Dialog>
          ) : null}
          <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
            <ToolbarGroup lastChild>
              {this.props.viewer.id === user.id ? (
                <Button variant="text" href="/logout">
                  Logg ut
                </Button>
              ) : null}
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
                <MenuItem onClick={this.openEditMember}>Rediger</MenuItem>
                {this.props.viewer.id === user.id ? (
                  <MenuItem component={Link} to={`/users/${user.id}/reset`}>
                    Bytt passord
                  </MenuItem>
                ) : null}
                {this.props.viewer.id === user.id ? (
                  <MenuItem href="/login/facebook">
                    Logg på med Facebook
                  </MenuItem>
                ) : null}
                {this.props.viewer.id === user.id ? (
                  <MenuItem href="/login/google">Logg på med Google</MenuItem>
                ) : null}
                {isAdmin ? (
                  <MenuItem
                    onClick={() => {
                      this.setState({ joinGroup: !this.state.joinGroup });
                    }}
                  >
                    Legg til i gruppe
                  </MenuItem>
                ) : null}
                {isAdmin ? (
                  <MenuItem
                    onClick={() => {
                      this.setState({ addingRole: !this.state.addingRole });
                    }}
                  >
                    Legg til verv/rolle
                  </MenuItem>
                ) : null}
              </Menu>
            </ToolbarGroup>
          </Toolbar>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginLeft: -desktopGutterLess,
            marginRight: -desktopGutterLess,
          }}
        >
          <div
            style={{
              paddingLeft: desktopGutterLess,
              paddingRight: desktopGutterLess,
            }}
          >
            {user.email ? (
              <div>
                <a href={`mailto:${user.email}`}>{user.email}</a>
              </div>
            ) : null}
            {user.phone ? (
              <div>
                <Phone phone={user.phone} />
              </div>
            ) : null}
            {user.address && user.postcode && user.city ? (
              <div>
                {user.address}
                <br />
                {user.postcode} {user.city}
              </div>
            ) : null}
            {member.roles && member.roles.length ? (
              <div>
                <h3>Verv</h3>
                <List>
                  {member.roles.map((role) => {
                    if (role) {
                      return (
                        <ListItem key={role.id}>
                          <ListItemText
                            primary={role.name}
                            secondary={
                              role.email ? (
                                <a href={`mailto:${role.email}`}>
                                  {role.email}
                                </a>
                              ) : null
                            }
                          />
                          {isAdmin ? (
                            <ListItemSecondaryAction>
                              <IconButton
                                onClick={(event) => {
                                  event.preventDefault();
                                  return this.removeRole(role.id);
                                }}
                              >
                                <Close />
                              </IconButton>
                            </ListItemSecondaryAction>
                          ) : null}
                        </ListItem>
                      );
                    }
                    return null;
                  })}
                </List>
              </div>
            ) : null}
            <div>
              {user.groups && user.groups.length ? (
                <div>
                  <h3>Grupper</h3>
                  <List>
                    {user.groups.map((group) => {
                      if (group) {
                        return (
                          <ListItem
                            key={group.id}
                            component={Link}
                            to={`/group/${group.id}`}
                          >
                            <ListItemText primary={group.name} />
                            {isAdmin ? (
                              <ListItemSecondaryAction>
                                <IconButton
                                  onClick={(event) => {
                                    event.preventDefault();
                                    return this.leaveGroup(user, group);
                                  }}
                                >
                                  <Close />
                                </IconButton>
                              </ListItemSecondaryAction>
                            ) : null}
                          </ListItem>
                        );
                      }
                      return null;
                    })}
                  </List>
                </div>
              ) : null}
            </div>
            {isAdmin && user ? (
              <div style={{ backgroundColor: lightBlue100 }}>
                <h2>Admininfo</h2>
                <Text text={user.membershipHistory || ""} />
                <div>
                  Brukernavn {user.username}, aktiv:{" "}
                  <Yesno value={user.isActive || true} />, i medlemslista:{" "}
                  <Yesno value={user.inList || true} />, unngår epost:{" "}
                  <Yesno value={user.noEmail || false} />, permisjon:{" "}
                  <Yesno value={user.onLeave || false} />
                </div>
              </div>
            ) : null}
          </div>
          <div
            style={{
              paddingLeft: desktopGutterLess,
              paddingRight: desktopGutterLess,
              width: "25%",
              minWidth: 230,
            }}
          >
            <ProfilePicture
              user={user}
              isViewer={user.id === viewer.id}
              isAdmin={isAdmin}
            />
            {user.born ? (
              <div>
                Bursdag <Date date={user.born} format="Do MMMM" />
              </div>
            ) : null}
            {user.joined ? (
              <div>
                Startet for <DateFromNow date={user.joined} />
                {user.nmfId ? ` og har NMF-nummer ${user.nmfId}` : null}
              </div>
            ) : null}
          </div>
        </div>
      </Paper>
    );
  }
}

export default createFragmentContainer(Member, {
  organization: graphql`
    fragment Member_organization on Organization {
      isMember
      isAdmin
      member(id: $id) {
        id
        roles {
          id
          name
          email
        }
        user {
          id
          username
          name
          email
          groups {
            id
            name
          }
          isActive
          isAdmin
          created
          facebookId
          googleId
          twitterId
          nmfId
          phone
          address
          postcode
          city
          country
          born
          joined
          instrument
          instrumentInsurance
          membershipHistory
          membershipStatus
          inList
          onLeave
          noEmail
          ...ProfilePicture_user
        }
      }
      groups {
        id
        name
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
    fragment Member_viewer on User {
      id
    }
  `,
});
