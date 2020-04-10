import IconButton from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Close from "@material-ui/icons/Close";
import Download from "@material-ui/icons/PlayForWork";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { ScoreItem_file } from "./__generated__/ScoreItem_file.graphql";

type Props = {
  file: ScoreItem_file,
  groupscore: any,
  removeScore: (file: ScoreItem_file) => void,
};

class ScoreItem extends React.Component<Props> {
  onDelete = (event) => {
    event.preventDefault();
    this.props.removeScore(this.props.file);
  };

  render() {
    const { file } = this.props;
    return (
      <a
        key={`${this.props.groupscore.id}-${file.id}`}
        href={file.path}
        download
      >
        <ListItem>
          <ListItemIcon>
            <Download />
          </ListItemIcon>
          <ListItemText primary={file.filename} />
          <ListItemSecondaryAction>
            <IconButton onClick={this.onDelete}>
              <Close />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </a>
    );
  }
}
export default createFragmentContainer(ScoreItem, {
  file: graphql`
    fragment ScoreItem_file on File {
      id
      filename
      path
    }
  `,
});
