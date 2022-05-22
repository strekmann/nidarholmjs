import List from "@material-ui/core/List";
import withStyles, { WithStyles } from "@material-ui/core/styles/withStyles";
import React from "react";

import MusicItem from "./MusicItem";

interface Props extends WithStyles<typeof styles> {
  music: Array<{
    id: string;
    piece: {
      id: string;
      title: string;
      composers: Array<string>;
    };
  }>;
  isMember: boolean;
  isMusicAdmin: boolean;
  remove: any; //({ id: string }) => void;
}

class MusicList extends React.Component<Props> {
  render() {
    const { classes } = this.props;
    return (
      <List className={classes.root}>
        {this.props.music.map((music) => {
          return (
            <MusicItem
              key={music.id}
              music={music}
              isMember={this.props.isMember}
              isMusicAdmin={this.props.isMusicAdmin}
              remove={this.props.remove}
            />
          );
        })}
      </List>
    );
  }
}

const styles = () => {
  return {
    root: {
      display: "inline-block",
    },
  };
};

export default withStyles(styles)(MusicList);
