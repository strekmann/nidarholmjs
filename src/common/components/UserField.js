// @flow

import AutoComplete from "material-ui/AutoComplete";
import Chip from "material-ui/Chip";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import UserFieldOrganization from "./__generated__/UserField_organization.graphql";

type Props = {
  organization: UserFieldOrganization,
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

  addUser = (user) => {
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
    return (
      <div>
        <AutoComplete
          floatingLabelText={this.props.title}
          filter={AutoComplete.fuzzyFilter}
          dataSource={users}
          dataSourceConfig={{ text: "name", value: "id" }}
          maxSearchResults={20}
          searchText={this.state.user}
          onNewRequest={this.addUser}
          onUpdateInput={this.onUserChange}
          hintText="Personer må allerede finnes i databasen"
          fullWidth
        />
        {this.state.users.map((user) => {
          return (
            <Chip
              key={user.id}
              onRequestDelete={() => {
                this.removeUser(user);
              }}
            >
              {user.name}
            </Chip>
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
