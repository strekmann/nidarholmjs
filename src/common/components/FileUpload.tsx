import Dropzone from "react-dropzone";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { PermissionArray, Viewer } from "../types";
import { FileUpload_organization } from "./__generated__/FileUpload_organization.graphql";

import PermissionField from "./PermissionField";
import TagField from "./TagField";

type Props = {
  memberGroupId: string,
  onDrop: any, //([{}], PermissionArray, string[]) => {},
  organization: FileUpload_organization,
  permissions: PermissionArray,
  viewer: Viewer,
};

type State = {
  permissions: PermissionArray,
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
        <div style={{ width: "50%", minWidth: 300, flexGrow: 1 }}>
          <h3>1. Rettigheter og merkelapper</h3>
          <div>Hvis du ikke endrer, er det bare du som kan se filene</div>
          <PermissionField
            permissions={this.state.permissions}
            onChange={this.onPermissionChange}
            groups={viewer.groups}
            users={[]}
            memberGroupId={this.props.memberGroupId}
            fullWidth
          />
          <TagField
            fileTags={this.state.tags}
            onChange={this.onTagChange}
            organization={this.props.organization}
            fullWidth
          />
        </div>
        <div style={{ width: "50%", minWidth: 300, flexGrow: 1 }}>
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
