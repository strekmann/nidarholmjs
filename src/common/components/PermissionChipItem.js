/* @flow */

import Avatar from "material-ui/Avatar";
import Chip from "material-ui/Chip";
import { red500, green500, lightBlue500 } from "material-ui/styles/colors";
import VisibilityOff from "material-ui/svg-icons/action/visibility-off";
import Group from "material-ui/svg-icons/social/group";
import Public from "material-ui/svg-icons/social/public";
import * as React from "react";

type Props = {
  id: ?string,
  memberGroupId: ?string,
  removePermission: (string) => void,
  text: ?string,
};

export default class PermissionChipItem extends React.Component<Props> {
  removePermission = () => {
    if (this.props.id && this.props.removePermission) {
      this.props.removePermission(this.props.id);
    }
  };
  render() {
    let icon;
    if (!this.props.id) {
      icon = <Avatar backgroundColor={red500} icon={<VisibilityOff />} />;
    } else if (this.props.id === "p") {
      icon = <Avatar backgroundColor={green500} icon={<Public />} />;
    } else if (this.props.id === this.props.memberGroupId) {
      icon = <Avatar backgroundColor={lightBlue500} icon={<Group />} />;
    }
    return (
      <Chip
        key={this.props.id}
        onRequestDelete={
          this.props.id && this.props.removePermission
            ? this.removePermission
            : null
        }
        style={{ marginRight: 8 }}
      >
        {icon} {this.props.text}
      </Chip>
    );
  }
}
