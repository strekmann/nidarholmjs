import IconButton from "@material-ui/core/Button";
import ActionDelete from "@material-ui/icons/Clear";
import React from "react";

type Props = {
  onRemove: any,
  item: string,
};

export default class extends React.Component<Props> {
  handleRemove = () => {
    const { onRemove, item } = this.props;
    onRemove(item);
  };

  render() {
    return (
      <IconButton>
        <ActionDelete onClick={this.handleRemove} />
      </IconButton>
    );
  }
}
