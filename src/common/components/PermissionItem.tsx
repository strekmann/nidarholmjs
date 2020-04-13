import IconButton from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Close from "@material-ui/icons/Close";
import React from "react";

type Props = {
  name: string,
  id: string,
  removePermission: (_: string) => void,
};

export default class PermissionItem extends React.Component<Props> {
  removePermission = () => {
    this.props.removePermission(this.props.id);
  };
  render() {
    return (
      <ListItem>
        <ListItemText primary={this.props.name} />
        <ListItemSecondaryAction>
          <IconButton onClick={this.removePermission}>
            <Close />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}
