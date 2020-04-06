/* global FormData */

import { List } from "material-ui/List";
import axios from "axios";
import * as React from "react";
import Dropzone from "react-dropzone";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import AddScoreMutation from "../mutations/AddScore";
import RemoveScoreMutation from "../mutations/RemoveScore";

import ScoreItem from "./ScoreItem";

type Props = {
  name: string;
  groupscore: {
    name: string;
    files: {
      edges: Array<{
        node: {
          id: string;
        };
      }>;
    };
  };
  piece: {
    id: string;
  };
  relay: RelayProp;
};

class GroupscoreUpload extends React.Component<Props> {
  onDrop = (files) => {
    this.uploadScores(files, this.props.groupscore);
  };

  uploadScores = (files, groupscore) => {
    const { relay } = this.props;
    files.forEach((file) => {
      const data = new FormData();
      data.append("file", file);

      axios.post("/upload", data).then((response) => {
        AddScoreMutation.commit(relay.environment, {
          hex: response.data.hex,
          filename: file.name,
          groupscore,
          piece: this.props.piece,
        });
      });
    });
  };

  removeScore = (file) => {
    const { relay } = this.props;
    RemoveScoreMutation.commit(relay.environment, file.id, this.props.piece.id);
  };

  render() {
    return (
      <div>
        <h3>{this.props.groupscore.name}</h3>
        <Dropzone
          style={{
            minWidth: 300,
            minHeight: 50,
            borderWidth: 2,
            borderColor: "#666",
            borderStyle: "dashed",
            borderRadius: 5,
          }}
          onDrop={this.onDrop}
        />
        <List>
          {this.props.groupscore.files.edges.map((edge) => {
            const file = edge.node;
            return (
              <ScoreItem
                file={file}
                groupscore={this.props.groupscore}
                key={file.id}
                removeScore={this.removeScore}
              />
            );
          })}
        </List>
      </div>
    );
  }
}

export default createFragmentContainer(GroupscoreUpload, {
  groupscore: graphql`
    fragment GroupscoreUpload_groupscore on Groupscore {
      id
      name
      files {
        edges {
          node {
            id
            ...ScoreItem_file
          }
        }
      }
    }
  `,
});
