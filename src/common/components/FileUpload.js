/* @flow */

import Dropzone from "react-dropzone";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import PermissionField from "./PermissionField";
import TagField from "./TagField";

type Props = {
  memberGroupId: string,
  onDrop: (
    [{}],
    Array<{
      id: string,
      name: string,
    }>,
    string[],
  ) => {},
  organization: {},
  permissions: Array<{
    id: string,
    name: string,
  }>,
  viewer: {
    friends: Array<{
      id: string,
      name: string,
    }>,
    groups: Array<{
      id: string,
      name: string,
    }>,
  },
};

type State = {
  permissions: Array<{
    id: string,
    name: string,
  }>,
  tags: Array<string>,
};

class FileUpload extends React.Component<Props, State> {
  state = {
    permissions: this.props.permissions || [],
    tags: [],
  };

  onDrop = (files) => {
    const { permissions, tags } = this.state;
    this.props.onDrop(files, permissions, tags);
  };

  onPermissionChange = (permissions) => {
    this.setState({ permissions });
  };

  onTagChange = (tags) => {
    this.setState({ tags });
  };

  render() {
    const { viewer } = this.props;
    return (
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ width: "50%", minWidth: 300, flexGrow: "1" }}>
          <h3>1. Rettigheter og merkelapper</h3>
          <div>Hvis du ikke endrer, er det bare du som kan se filene</div>
          <PermissionField
            permissions={this.state.permissions}
            onChange={this.onPermissionChange}
            groups={viewer.groups}
            users={viewer.friends}
            memberGroupId={this.props.memberGroupId}
          />
          <TagField
            fileTags={this.state.tags}
            onChange={this.onTagChange}
            organization={this.props.organization}
          />
        </div>
        <div style={{ width: "50%", minWidth: 300, flexGrow: "1" }}>
          <h3>2. Last opp</h3>
          <p>Du kan dra filer til, eller klikke i firkanten</p>
          <Dropzone onDrop={this.onDrop} />
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(FileUpload, {
  organization: graphql`
    fragment FileUpload_organization on Organization {
      ...TagField_organization
    }
  `,
});
