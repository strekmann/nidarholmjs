import AutoComplete from "material-ui/AutoComplete";
import Chip from "material-ui/Chip";
import PropTypes from "prop-types";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

class UserField extends React.Component {
  static propTypes = {
    organization: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
  };

  state = {
    user: "",
    users: this.props.users || [],
  };

  onUserChange = (user) => {
    this.setState({ user });
  };

  addUser = (user) => {
    const { users } = this.state;
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
