// @flow

import IconButton from "material-ui/IconButton";
import { ListItem } from "material-ui/List";
import Download from "material-ui/svg-icons/file/file-download";
import Close from "material-ui/svg-icons/navigation/close";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import type ScoreItemFile from "./__generated__/ScoreItem_file.graphql";

type Props = {
  file: ScoreItemFile,
  groupscore: any,
  removeScore: (ScoreItemFile) => void,
};

class ScoreItem extends React.Component<Props> {
  onDelete = (event) => {
    const { file, removeScore } = this.props;
    event.preventDefault();
    removeScore(file);
  };

  render() {
    const { file, groupscore } = this.props;
    const del = (
      <IconButton onClick={this.onDelete}>
        <Close />
      </IconButton>
    );
    return (
      <a key={`${groupscore.id}-${file.id}`} href={file.path} download>
        <ListItem
          primaryText={file.filename}
          leftIcon={<Download />}
          rightIconButton={del}
        />
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
