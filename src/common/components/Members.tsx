import {
  DialogContent,
  DialogTitle,
  FormControlLabel,
} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Link from "found/Link";
import AutoComplete from "material-ui/AutoComplete";
import SelectField from "material-ui/SelectField";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import AddUserMutation from "../mutations/AddUser";
import GroupItem from "./GroupItem";
import { Members_organization } from "./__generated__/Members_organization.graphql";

type Props = {
  relay: RelayProp,
  router: any,
  organization: Members_organization,
};

type State = {
  menuIsOpen: null | HTMLElement,
  addUser: boolean,
  name: string,
  email: string,
  instrument: string,
  new: boolean,
  groupId?: string,
  member: boolean,
};

class Members extends React.Component<Props, State> {
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

  onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  onChangeGroup = (event, index, groupId) => {
    this.setState({ groupId });
  };

  onChangeInstrument = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ instrument: event.target.value });
  };

  onChangeUserName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };

  onCheckMember = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ member: event.target.checked });
  };

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
          <Dialog open={this.state.addUser} onClose={this.closeAddUser}>
            <DialogTitle>Finn eller legg til medlem</DialogTitle>
            <DialogContent>
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
                      label="E-post"
                      type="email"
                      value={this.state.email}
                      onChange={this.onChangeEmail}
                    />
                  </div>
                  <div>
                    <TextField
                      id="instrument"
                      label="Instrument"
                      value={this.state.instrument}
                      onChange={this.onChangeInstrument}
                    />
                  </div>
                  <div>
                    <FormControlLabel
                      control={
                        <Checkbox
                          id="member"
                          name="member"
                          checked={this.state.member}
                          onChange={this.onCheckMember}
                          color="primary"
                        />
                      }
                      label="Gi personen medlemsrettigheter"
                    ></FormControlLabel>
                  </div>
                  <div>
                    <SelectField
                      id="group"
                      floatingLabelText="Instrumentgruppe"
                      value={this.state.groupId}
                      onChange={this.onChangeGroup}
                    >
                      <MenuItem>(Ingen)</MenuItem>
                      {instrumentGroups.map((group) => {
                        return (
                          <MenuItem key={group.id} value={group.id}>
                            {group.name}
                          </MenuItem>
                        );
                      })}
                    </SelectField>
                  </div>
                  <div>
                    <Button variant="contained" type="submit" color="primary">
                      Legg til
                    </Button>
                    <Button
                      variant="contained"
                      type="reset"
                      onClick={this.closeAddUser}
                    >
                      Avbryt
                    </Button>
                  </div>
                </form>
              ) : (
                <div>
                  <Button
                    variant="contained"
                    type="reset"
                    onClick={this.closeAddUser}
                  >
                    Avbryt
                  </Button>
                </div>
              )}
            </DialogContent>
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
