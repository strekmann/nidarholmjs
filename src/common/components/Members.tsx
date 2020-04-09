import Link from "found/Link";
import { RelayProp } from "react-relay";
import AutoComplete from "material-ui/AutoComplete";
import Checkbox from "material-ui/Checkbox";
import Dialog from "material-ui/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import SelectField from "material-ui/SelectField";
import TextField from "material-ui/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import * as React from "react";
import PropTypes from "prop-types";
import { createFragmentContainer, graphql } from "react-relay";

import AddUserMutation from "../mutations/AddUser";
import theme from "../theme";

import { Members_organization } from "./__generated__/Members_organization.graphql";
import GroupItem from "./GroupItem";

type Props = {
  relay: RelayProp;
  router: any;
  organization: Members_organization;
};

type State = {
  menuIsOpen: null | HTMLElement;
  addUser: boolean;
  name: string;
  email: string;
  instrument: string;
  new: boolean;
  groupId?: string;
  member: boolean;
};

class Members extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    menuIsOpen: null,
    addUser: false,
    name: "",
    email: "",
    instrument: "",
    new: false,
    groupId: undefined,
    member: false,
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

  onAutoCompleteChoose = (element, chosen) => {
    if (chosen > -1) {
      this.props.router.push({ pathname: `/users/${element.value}` });
    } else {
      // Pressed enter without choosing
      this.setState({ new: true });
    }
  };

  onChangeEmail = (event, email) => {
    this.setState({ email });
  };

  onChangeGroup = (event, index, groupId) => {
    this.setState({ groupId });
  };

  onChangeInstrument = (event, instrument) => {
    this.setState({ instrument });
  };

  onChangeUserName = (name) => {
    this.setState({ name });
  };

  onCheckMember = (event, member) => {
    this.setState({ member });
  };

  muiTheme: {};

  addUser = (event) => {
    event.preventDefault();
    const { relay } = this.props;
    const { name, email, instrument, member, groupId } = this.state;
    AddUserMutation.commit(
      relay.environment,
      {
        name,
        email,
        instrument,
        isMember: !!member,
        groupId,
      },
      (results) => {
        this.setState({ addUser: false });
        this.props.router.push({
          pathname: `/users/${results.addUser.newUser.id}`,
        });
      },
    );
  };

  toggleAddUser = () => {
    this.setState({
      addUser: !this.state.addUser,
    });
  };

  closeAddUser = () => {
    this.setState({
      addUser: false,
    });
  };

  render() {
    const { organization } = this.props;
    const { instrumentGroups, isAdmin, isMember, users } = organization;
    const searchMessage =
      "Mens du skriver inn navn, søker vi opp de med likest navn, i tilfelle personen allerede er registrert. For å legge inn en ny person, skriver du hele navnet og trykker enter.";
    return (
      <Paper className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1>Medlemmer</h1>
          </div>
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
                <MenuItem onClick={this.toggleAddUser}>
                  Finn / legg til medlem
                </MenuItem>
                <MenuItem component={Link} to="/groups">
                  Grupper
                </MenuItem>
                <MenuItem component={Link} to="/members/roles">
                  Verv og roller
                </MenuItem>
              </Menu>
            </div>
          ) : null}
          <Dialog
            title="Finn / legg til medlem"
            open={this.state.addUser}
            onRequestClose={this.closeAddUser}
            autoScrollBodyContent
          >
            <p>{searchMessage}</p>
            <AutoComplete
              hintText="Navn"
              dataSource={users.map((user) => {
                return { text: user.name, value: user.id };
              })}
              floatingLabelText="Navn"
              onUpdateInput={this.onChangeUserName}
              onNewRequest={this.onAutoCompleteChoose}
              filter={AutoComplete.fuzzyFilter}
              fullWidth
            />
            {this.state.new ? (
              <form onSubmit={this.addUser}>
                <div>
                  <TextField
                    id="email"
                    floatingLabelText="E-post"
                    type="email"
                    value={this.state.email}
                    onChange={this.onChangeEmail}
                  />
                </div>
                <div>
                  <TextField
                    id="instrument"
                    floatingLabelText="Instrument"
                    value={this.state.instrument}
                    onChange={this.onChangeInstrument}
                  />
                </div>
                <div>
                  <Checkbox
                    id="member"
                    label="Gi personen medlemsrettigheter"
                    checked={this.state.member}
                    onCheck={this.onCheckMember}
                  />
                </div>
                <div>
                  <SelectField
                    id="group"
                    floatingLabelText="Instrumentgruppe"
                    value={this.state.groupId}
                    onChange={this.onChangeGroup}
                  >
                    <MenuItem primaryText="(Ingen)" />
                    {instrumentGroups.map((group) => {
                      return (
                        <MenuItem
                          key={group.id}
                          value={group.id}
                          primaryText={group.name}
                        />
                      );
                    })}
                  </SelectField>
                </div>
                <div>
                  <RaisedButton type="submit" label="Legg til" primary />
                  <RaisedButton
                    type="reset"
                    label="Avbryt"
                    onClick={this.closeAddUser}
                  />
                </div>
              </form>
            ) : (
              <div>
                <RaisedButton
                  type="reset"
                  label="Avbryt"
                  onClick={this.closeAddUser}
                />
              </div>
            )}
          </Dialog>
        </div>
        {instrumentGroups.map((group) => {
          return (
            <GroupItem
              group={group}
              key={group.id}
              isMember={isMember}
              isAdmin={isAdmin}
            />
          );
        })}
      </Paper>
    );
  }
}

export default createFragmentContainer(Members, {
  organization: graphql`
    fragment Members_organization on Organization {
      isMember
      isAdmin
      instrumentGroups {
        id
        name
        ...GroupItem_group
      }
      users {
        id
        name
        username
      }
    }
  `,
});
