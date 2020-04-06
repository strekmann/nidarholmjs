/* eslint "react/require-default-props": 0 */

import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import FileItem from "./FileItem";

type Props = {
  files: {
    edges: [
      {
        node: {
          id: string;
        };
      },
    ];
  };
  memberGroupId: string;
  style: {
    display: string;
    flexWrap: string;
  };
  title: string;
  onSavePermissions: () => {};
  onSetProjectPoster: () => {};
  viewer: {};
  organization: {};
  searchTag: () => {};
};

class FileList extends React.Component<Props> {
  render() {
    const style =
      this.props.style ||
      ({
        display: "flex",
        flexWrap: "wrap",
      } as React.CSSProperties);
    style.display = "flex";
    style.flexWrap = "wrap";
    return (
      <div>
        {this.props.title ? <h2>{this.props.title}</h2> : null}
        <div style={style}>
          {this.props.files.edges.map((edge) => {
            return (
              <FileItem
                key={edge.node.id}
                memberGroupId={this.props.memberGroupId}
                onSavePermissions={this.props.onSavePermissions}
                onSetProjectPoster={this.props.onSetProjectPoster}
                viewer={this.props.viewer}
                searchTag={this.props.searchTag}
                organization={this.props.organization}
                {...edge.node}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(FileList, {
  organization: graphql`
    fragment FileList_organization on Organization {
      ...FileItem_organization
    }
  `,
});
