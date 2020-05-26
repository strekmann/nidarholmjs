import { TextField } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import Autocomplete from "@material-ui/lab/Autocomplete";
import * as React from "react";
import { PermissionArray } from "../types";
import { AutocompleteOptionType } from "./Autocomplete";

type Props = {
  groups?: Array<{
    id: string,
    name?: string,
  }>,
  onChange: (permissions: PermissionArray) => void,
  permissions: PermissionArray,
  users: Array<{
    id: string,
    name?: string,
  }>,
  fullWidth?: boolean,
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

  setPermissions = (_: any, permissions: AutocompleteOptionType[]) => {
    this.props.onChange(permissions);
  };

  render() {
    const permissions: AutocompleteOptionType[] = [];
    const groups = this.props.groups || [];
    // const users = this.props.users || [];
    permissions.push({ id: "p", label: "Verden" });
    groups.forEach((group) => {
      if (group) {
        permissions.push({ id: group.id, label: group.name || "" });
      }
    });
    /*
        users.forEach(user => {
            permissions.push({ id: user.id, name: user.name });
        });
        */
    return (
      <div>
        <Autocomplete
          multiple
          options={permissions}
          onChange={this.setPermissions}
          getOptionSelected={(option, value) => {
            return option.id === value.id;
          }}
          getOptionLabel={(option) => option.label}
          value={this.props.permissions.map((permission) => {
            return {
              id: permission.id || "",
              label: permission.name || permission.label || "",
            };
          })}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label="Legg til rettigheter"
                onChange={this.onPermissionChange}
                fullWidth={this.props.fullWidth}
              />
            );
          }}
          renderTags={(options, getTagProps) => {
            return options.map((option, index) => {
              return (
                <Chip
                  variant="outlined"
                  label={option.label}
                  {...getTagProps({ index })}
                />
              );
            });
          }}
        />
      </div>
    );
  }
}
