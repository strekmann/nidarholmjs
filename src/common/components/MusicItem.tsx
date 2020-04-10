import Link from "found/Link";
import IconButton from "@material-ui/core/Button";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import CloseIcon from "@material-ui/icons/Close";
import MusicNote from "@material-ui/icons/MusicNote";
import * as React from "react";

type Props = {
  music: {
    id: string,
    piece: {
      id: string,
      title: string,
      composers: Array<string>,
    },
  },
  isMember: boolean,
  isMusicAdmin: boolean,
  remove: ({ id: string }) => void,
};

export default class MusicItem extends React.Component<Props> {
  render() {
    const { music } = this.props;
    if (this.props.isMember) {
      return (
        <ListItem key={music.id}>
          <ListItemIcon>
            <Link to={`/music/${music.piece.id}`}>
              <MusicNote />
            </Link>
          </ListItemIcon>
          <ListItemText
            primary={music.piece.title}
            secondary={music.piece.composers}
          />
          {this.props.isMusicAdmin ? (
            <ListItemSecondaryAction>
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  this.props.remove(music.piece);
                }}
              >
                <CloseIcon />
              </IconButton>
            </ListItemSecondaryAction>
          ) : null}
        </ListItem>
      );
    }
    return (
      <ListItem>
        <ListItemText
          primary={music.piece.title}
          secondary={music.piece.composers}
        />
      </ListItem>
    );
  }
}
