import MenuItem from "@material-ui/core/MenuItem";
import * as React from "react";

type Props = {
  item: {
    id: string,
    name: string,
  },
  onChoose: any,
};
type State = {};

export default class extends React.Component<Props, State> {
  onClick = () => {
    const { item } = this.props;
    this.props.onChoose(item);
  };

  render() {
    const { item } = this.props;
    return <MenuItem onClick={this.onClick}>{item.name}</MenuItem>;
  }
}
