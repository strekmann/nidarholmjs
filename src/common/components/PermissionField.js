/* @flow */

import AutoComplete from "material-ui/AutoComplete";
import * as React from "react";

import PermissionChips from "./PermissionChips";

type Props = {
  groups: Array<{
    id: string,
    name: string,
  }>,
  memberGroupId?: string,
  onChange: (
    Array<{
      id: string,
      name: string,
    }>,
  ) => void,
  permissions: Array<{
    id: string,
    name: string,
  }>,
  users: Array<{
    id: string,
    name: string,
  }>,
};

type State = {
  permission: string,
};

export default class PermissionField extends React.Component<Props, State> {
  state = {
    permission: "",
  };

  onPermissionChange = (value: string) => {
    this.setState({
      permission: value,
    });
  };

  addPermission = (chosen: { id: string, name: string }, index: number) => {
    const permissions = this.props.permissions.slice();
    if (index > -1) {
      permissions.push(chosen);
    }
    this.setState({
      permission: "",
    });
    this.props.onChange(permissions);
  };

  removePermission = (permissionId: string) => {
    const permissions = this.props.permissions.filter((_p) => {
      return _p.id !== permissionId;
    });
    this.props.onChange(permissions);
  };

  render() {
    const permissions = [];
    const groups = this.props.groups || [];
    // const users = this.props.users || [];
    permissions.push({ id: "p", name: "Verden" });
    groups.forEach((group) => {
      permissions.push({ id: group.id, name: group.name });
    });
    /*
        users.forEach(user => {
            permissions.push({ id: user.id, name: user.name });
        });
        */
    return (
      <div>
        <AutoComplete
          id="permissions"
          floatingLabelText="Legg til rettigheter"
          filter={AutoComplete.fuzzyFilter}
          dataSource={permissions}
          dataSourceConfig={{ text: "name", value: "id" }}
          maxSearchResults={8}
          searchText={this.state.permission}
          onNewRequest={this.addPermission}
          onUpdateInput={this.onPermissionChange}
        />
        <PermissionChips
          permissions={this.props.permissions}
          groups={this.props.groups}
          users={this.props.users}
          memberGroupId={this.props.memberGroupId}
          removePermission={this.removePermission}
        />
      </div>
    );
  }
}
