import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import green from "@material-ui/core/colors/green";
import lightBlue from "@material-ui/core/colors/lightBlue";
import red from "@material-ui/core/colors/red";
import Group from "@material-ui/icons/Group";
import Public from "@material-ui/icons/Public";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { withStyles } from "@material-ui/core/styles";
import * as React from "react";

const useStyles = () => {
  return {
    red: {
      backgroundColor: red[500],
    },
    green: {
      backgroundColor: green[500],
    },
    lightBlue: {
      backgroundColor: lightBlue[500],
    },
  };
};

type Props = {
  id?: string,
  memberGroupId?: string,
  removePermission: (id: string) => void,
  text?: string,
  classes: any,
};

class PermissionChipItem extends React.Component<Props> {
  removePermission = () => {
    if (this.props.id && this.props.removePermission) {
      this.props.removePermission(this.props.id);
    }
  };
  render() {
    let icon;
    const { classes } = this.props;
    if (!this.props.id) {
      icon = (
        <Avatar className={classes.red}>
          <VisibilityOff />
        </Avatar>
      );
    } else if (this.props.id === "p") {
      icon = (
        <Avatar className={classes.green}>
          <Public />
        </Avatar>
      );
    } else if (this.props.id === this.props.memberGroupId) {
      icon = (
        <Avatar className={classes.lightBlue}>
          <Group />
        </Avatar>
      );
    }
    return (
      <Chip
        key={this.props.id}
        onDelete={
          this.props.id && this.props.removePermission
            ? this.removePermission
            : undefined
        }
        avatar={icon}
        label={this.props.text}
        style={{ marginRight: 8 }}
      />
    );
  }
}

export default withStyles(useStyles)(PermissionChipItem);
