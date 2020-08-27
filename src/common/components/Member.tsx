import MomentUtils from "@date-io/moment";
import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import lightBlue from "@material-ui/core/colors/lightBlue";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import withTheme from "@material-ui/core/styles/withTheme";
import TextField from "@material-ui/core/TextField";
import Toolbar from "@material-ui/core/Toolbar";
import Close from "@material-ui/icons/Close";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Link from "found/Link";
import moment from "moment";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import AddRoleMutation from "../mutations/AddRole";
import EditUserMutation from "../mutations/EditUser";
import JoinGroupMutation from "../mutations/JoinGroup";
import LeaveGroupMutation from "../mutations/LeaveGroup";
import RemoveRoleMutation from "../mutations/RemoveRole";
import Autocomplete, { AutocompleteOptionType } from "./Autocomplete";
import Date from "./Date";
import DateFromNow from "./DateFromNow";
import Phone from "./Phone";
import ProfilePicture from "./ProfilePicture";
import Text from "./Text";
import Yesno from "./Yesno";
import { Member_organization } from "./__generated__/Member_organization.graphql";
import { Member_viewer } from "./__generated__/Member_viewer.graphql";

export type UserOptionType = {
  inputValue?: string;
  id?: string;
  name: string;
};

type Props = {
  organization: Member_organization;
  relay: RelayProp;
  theme: Theme;
  viewer: Member_viewer;
};

type State = {
  name: string;
  username: string;
  phone: string;
  email: string;
  instrument: string;
  born?: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  joined?: string;
  nmfId: string;
  membershipHistory: string;
  inList: boolean;
  onLeave: boolean;
  noEmail: boolean;
  addingRole: boolean;
  editMember: boolean;
  joinGroup: boolean;
  menuIsOpen: null | HTMLElement;
};

class Member extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    let member;
    let user;
    const { organization } = this.props;
    this.state = {
      name: "",
      username: "",
      phone: "",
      email: "",
      instrument: "",
      born: undefined,
      address: "",
      postcode: "",
      city: "",
      country: "",
      joined: undefined,
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
            born: born ? moment(born).toDate() : undefined,
            address: address || "",
            postcode: postcode || "",
            city: city || "",
            country: country || "",
            joined: joined ? moment(joined).toDate() : undefined,
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
  onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };
  onChangePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ phone: event.target.value });
  };
  onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };
  onChangeInstrument = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ instrument: event.target.value });
  };
  onChangeAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ address: event.target.value });
  };
  onChangePostcode = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ postcode: event.target.value });
  };
  onChangeCity = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ city: event.target.value });
  };
  onChangeCountry = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ country: event.target.value });
  };
  onChangeMembershipHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ membershipHistory: event.target.value });
  };
  onChangeJoined = (joined: moment.Moment | null) => {
    this.setState({ joined: joined ? joined.startOf("date") : null });
  };
  onChangeBorn = (born: moment.Moment | null) => {
    this.setState({ born: born ? born.startOf("date") : null });
  };
  onChangeInList = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inList: event.target.checked });
  };
  onChangeOnLeave = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ onLeave: event.target.checked });
  };
  onChangeNoEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ noEmail: event.target.checked });
  };

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
      menuIsOpen: null,
    });
  };
  addRole = (roleId: string) => {
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

  removeRole = (roleId: string) => {
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

  joinGroup = (_: any, selection: AutocompleteOptionType | null) => {
    this.setState({ joinGroup: false, menuIsOpen: null });
    if (this.props.organization.member && this.props.organization.member.user) {
      JoinGroupMutation.commit(
        this.props.relay.environment,
        {
          groupId: selection.id,
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
    const { organization, theme, viewer } = this.props;
    const { groups, isAdmin, member, roles } = organization;
    if (!member) {
      throw new Error("Member not defined");
    }
    const { user } = member;
    if (!user) {
      throw new Error("User not defined in member");
    }
    if (this.state.editMember) {
      return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Paper className="row">
            <form onSubmit={this.saveMember}>
              <div>
                <TextField
                  id="name"
                  label="Navn"
                  onChange={this.onChangeName}
                  value={this.state.name}
                />
              </div>
              <div>
                <TextField
                  id="phone"
                  label="Telefon"
                  onChange={this.onChangePhone}
                  value={this.state.phone}
                />
              </div>
              <div>
                <TextField
                  id="email"
                  label="E-post"
                  onChange={this.onChangeEmail}
                  value={this.state.email}
                />
              </div>
              <div>
                <TextField
                  id="instrument"
                  label="Instrument"
                  onChange={this.onChangeInstrument}
                  value={this.state.instrument}
                />
              </div>
              <div>
                <DatePicker
                  id="born"
                  label="Fødselsdato"
                  onChange={this.onChangeBorn}
                  value={this.state.born || null}
                  format="ll"
                  autoOk
                />
              </div>
              <div>
                <TextField
                  id="address"
                  label="Adresse"
                  onChange={this.onChangeAddress}
                  value={this.state.address}
                />
              </div>
              <div>
                <TextField
                  id="postcode"
                  label="Postnummer"
                  onChange={this.onChangePostcode}
                  value={this.state.postcode}
                />
              </div>
              <div>
                <TextField
                  id="city"
                  label="Sted"
                  onChange={this.onChangeCity}
                  value={this.state.city}
                />
              </div>
              <div>
                <TextField
                  id="country"
                  label="Land"
                  onChange={this.onChangeCountry}
                  value={this.state.country}
                />
              </div>
              {isAdmin ? (
                <div>
                  <div>
                    <TextField
                      id="nmfId"
                      label="NMF-nummer"
                      value={this.state.nmfId}
                    />
                  </div>
                  <div>
                    <DatePicker
                      id="joined"
                      label="Startet i korpset"
                      onChange={this.onChangeJoined}
                      value={this.state.joined || null}
                      format="ll"
                    />
                  </div>
                  <div>
                    <TextField
                      id="membershipHistory"
                      label="Medlemskapshistorikk"
                      onChange={this.onChangeMembershipHistory}
                      value={this.state.membershipHistory}
                      multiline
                      fullWidth
                    />
                  </div>
                  <div>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="inList"
                          name="inList"
                          checked={this.state.inList}
                          onChange={this.onChangeInList}
                          color="primary"
                        />
                      }
                      label="Synlig i medlemslista"
                    ></FormControlLabel>
                  </div>
                  <div>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="onLeave"
                          name="onLeave"
                          checked={this.state.onLeave}
                          onChange={this.onChangeOnLeave}
                          color="primary"
                        />
                      }
                      label="Har permisjon"
                    ></FormControlLabel>
                  </div>
                  <div>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="noEmail"
                          name="noEmail"
                          checked={this.state.noEmail}
                          onChange={this.onChangeNoEmail}
                          color="primary"
                        />
                      }
                      label="Ikke epost"
                    ></FormControlLabel>
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
        </MuiPickersUtilsProvider>
      );
    }
    const groupOptions: AutocompleteOptionType[] = groups.map((group) => {
      return {
        label: `${group && group.name ? group.name : ""}`,
        id: group.id,
      };
    });
    return (
      <Paper className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>{user.name}</h1>
          {isAdmin && groups ? (
            <Dialog open={this.state.joinGroup} onClose={this.closeJoinGroup}>
              <DialogTitle>Legg til i gruppe</DialogTitle>
              <DialogContent>
                <Autocomplete
                  options={groupOptions}
                  onChange={this.joinGroup}
                  label="Gruppe"
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
          <Toolbar>
            <div>
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
                      this.setState({
                        joinGroup: !this.state.joinGroup,
                        menuIsOpen: null,
                      });
                    }}
                  >
                    Legg til i gruppe
                  </MenuItem>
                ) : null}
                {isAdmin ? (
                  <MenuItem
                    onClick={() => {
                      this.setState({
                        addingRole: !this.state.addingRole,
                        menuIsOpen: null,
                      });
                    }}
                  >
                    Legg til verv/rolle
                  </MenuItem>
                ) : null}
              </Menu>
            </div>
          </Toolbar>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginLeft: -theme.spacing(2),
            marginRight: -theme.spacing(2),
          }}
        >
          <div
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
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
              <div style={{ backgroundColor: lightBlue[100] }}>
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
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
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

export default withTheme(
  createFragmentContainer(Member, {
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
  }),
);
