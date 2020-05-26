import Chip from "@material-ui/core/Chip";
import TextField from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import matchSorter from "match-sorter";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { UserField_organization } from "./__generated__/UserField_organization.graphql";

type Props = {
  organization: UserField_organization,
  users: Array<{ id: string, name: string }>,
  onChange: any,
  title: string,
};

type State = {
  user: string,
  users: Array<{ id: string, name: string }>,
};

class UserField extends React.Component<Props, State> {
  state = {
    user: "",
    users: this.props.users || [],
  };

  onUserChange = (user) => {
    this.setState({ user });
  };

  addUser = (_: any, user: any | null) => {
    const users = this.state.users.slice();
    users.push(user);
    this.setState({
      users,
      user: "",
    });
    this.props.onChange(users);
  };

  removeUser = (user) => {
    const users = this.state.users.filter((c) => {
      return c.id !== user.id;
    });
    this.setState({ users });
    this.props.onChange(users);
  };

  render() {
    if (!this.props.organization) {
      return null;
    }
    const { users } = this.props.organization;
    const userOptions: any[] = users.map((user) => {
      return {
        id: user.id,
        user,
      };
    });

    return (
      <div>
        <Autocomplete
          options={userOptions}
          onChange={this.addUser}
          getOptionLabel={(option) => option.user.name}
          getOptionSelected={(option, value) => option.id === value.id}
          renderInput={(params) => (
            <TextField {...params} label={this.props.title} />
          )}
          filterOptions={(options, { inputValue }) =>
            matchSorter(options, inputValue, { keys: ["label"] })
          }
        />
        {this.state.users.map((user) => {
          return (
            <Chip
              key={user.id}
              onDelete={() => {
                this.removeUser(user);
              }}
              label={user.name}
            />
          );
        })}
      </div>
    );
  }
}

export default createFragmentContainer(UserField, {
  organization: graphql`
    fragment UserField_organization on Organization {
      id
      users {
        id
        name
      }
    }
  `,
});
