import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import InputLabel from "@material-ui/core/InputLabel";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Autocomplete from '@material-ui/lab/Autocomplete';
import Link from "found/Link";
import matchSorter from "match-sorter";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import AddUserMutation from "../mutations/AddUser";
import GroupItem from "./GroupItem";
import { UserOptionType } from "./Member";
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
  groupId?: string,
  member: boolean,
  userOption: UserOptionType | null
};

class Members extends React.Component<Props, State> {
  state = {
    menuIsOpen: null,
    addUser: false,
    name: "",
    email: "",
    instrument: "",
    groupId: undefined,
    member: false,
    userOption: null,
  };

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  onChangeGroup = (event: React.ChangeEvent<{ value: unknown }>) => {
    const groupId: string = event.target.value as string;
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

  onChangeUserOption = (event: any, newValue: UserOptionType | string | null) => {
    if (typeof newValue === 'string') {
      // timeout to avoid instant validation of the dialog's form.
      setTimeout(() => {
        this.setState({addUser: true, name: newValue});
      });
      return;
    }

    if (newValue && newValue.inputValue) {
      this.setState({ addUser: true, name: newValue.inputValue });
      return;
    }
    if (newValue.id) {
      this.props.router.push({ pathname: `/users/${newValue.id}` });
    }
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
    const userOptions: UserOptionType[] = users?.map((user) => {
        return { name: user?.name ?? "", id: user?.id ?? "" };
    }) ?? [];
    return (
      <Paper className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1>Medlemmer</h1>
          </div>
          {isAdmin ? (
            <div style={{ display: "flex" }}>
              <Autocomplete
                value={this.state.userOption}
                onChange={this.onChangeUserOption}
                filterOptions={(options, params) => {
                  const filtered = matchSorter(options, params.inputValue, {keys: ["name"]}) as UserOptionType[];
        
                  if (params.inputValue !== '') {
                    filtered.push({
                      inputValue: params.inputValue,
                      name: `Legg til "${params.inputValue}"`,
                    });
                  }
        
                  return filtered;
                }}
                options={userOptions}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  if (option.inputValue) {
                    return option.inputValue;
                  }
                  return option.name;
                }}
                freeSolo
                renderInput={(params) => {
                  return (
                  <TextField {...params} label="Finn eller legg til" style={{ width: 200 }} />);
                }}
               />
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
            <DialogTitle>Legg til medlem</DialogTitle>
            <form onSubmit={this.addUser}>
              <DialogContent>
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
                  <FormControl>
                    <InputLabel htmlFor="group">Instrumentgruppe</InputLabel>
                    <Select
                      native
                      inputProps={{id: "group", name: "group"}}
                      value={this.state.groupId}
                      onChange={this.onChangeGroup}
                    >
                      <option key="None" value="" aria-label="Ingen"></option>
                      {instrumentGroups.map((group) => {
                        return (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        );
                      })}
                    </Select>
                  </FormControl>
                </div>
              </DialogContent>
              <DialogActions>
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
              </DialogActions>
            </form>
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
