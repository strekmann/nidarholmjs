// @flow

import MenuItem from "material-ui/MenuItem";
import * as React from "react";

type Props = {
  user: {
    id: string,
    name: string,
  },
  onChoose: any,
};
type State = {};

class EventPersonResponsibilityChooserItem extends React.Component<
  Props,
  State,
> {
  onClick = () => {
    const { user } = this.props;
    this.props.onChoose(user);
  };

  render() {
    const { user } = this.props;
    return <MenuItem primaryText={user.name} onClick={this.onClick} />;
  }
}

export default EventPersonResponsibilityChooserItem;
