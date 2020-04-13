/* global FormData */

import IconButton from "@material-ui/core/Button";
import Person from "@material-ui/icons/Person";
import Camera from "@material-ui/icons/PhotoCamera";
import axios from "axios";
import React from "react";
import Dropzone from "react-dropzone";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import SetProfilePictureMutation from "../mutations/SetProfilePicture";

type Props = {
  isViewer: boolean,
  isAdmin: boolean,
  relay: RelayProp,
  user: {
    id: string,
    name: string,
    profilePicture: {
      normalPath: string,
    },
  },
};

class ProfilePicture extends React.Component<Props> {
  onDrop = (files) => {
    const { relay, user } = this.props;
    files.forEach((file) => {
      const data = new FormData();
      data.append("file", file);

      axios.post("/upload", data).then((response) => {
        SetProfilePictureMutation.commit(
          relay.environment,
          {
            hash: response.data.hex,
            mimetype: response.data.mimetype,
            size: response.data.size,
            userId: user.id,
          },
          undefined,
        );
      });
    });
  };

  render() {
    const { user, isViewer, isAdmin } = this.props;
    if (isViewer || isAdmin) {
      return (
        <Dropzone
          onDrop={this.onDrop}
          style={{
            maxWidth: "100%",
            cursor: "pointer",
          }}
        >
          <div style={{ position: "relative" }}>
            {user.profilePicture ? (
              <img
                src={user.profilePicture.normalPath}
                alt={`Bilde av ${user.name}`}
                className="responsive"
              />
            ) : (
              <Person
                alt={`Bilde av ${user.name}`}
                style={{
                  height: 100,
                  width: "100%",
                }}
              />
            )}
            <div style={{ position: "absolute", bottom: 0 }}>
              <IconButton>
                <Camera />
              </IconButton>
            </div>
          </div>
        </Dropzone>
      );
    }
    return (
      <div>
        {user.profilePicture ? (
          <img
            src={user.profilePicture.normalPath}
            alt={`Bilde av ${user.name}`}
            className="responsive"
          />
        ) : (
          <Person
            alt={`Bilde av ${user.name}`}
            style={{
              height: 100,
              width: "100%",
            }}
          />
        )}
      </div>
    );
  }
}

export default createFragmentContainer(ProfilePicture, {
  user: graphql`
    fragment ProfilePicture_user on User {
      id
      name
      profilePicture {
        normalPath
      }
    }
  `,
});
