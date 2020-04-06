import IconButton from "material-ui/IconButton";
import ActionDelete from "material-ui/svg-icons/content/clear";
import * as React from "react";

type Props = {
  onRemove: any;
  item: string;
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
