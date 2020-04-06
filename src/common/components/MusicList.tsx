import { List } from "material-ui/List";
import * as React from "react";

import MusicItem from "./MusicItem";

type Props = {
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
};

export default class MusicList extends React.Component<Props> {
  render() {
    return (
      <List>
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
