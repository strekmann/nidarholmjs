/* @flow */
/* global FormData */
/* eslint "no-console": 0 */

import type { RelayRefetchProp } from "react-relay";
import { createRefetchContainer, graphql } from "react-relay";
import axios from "axios";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import RaisedButton from "material-ui/RaisedButton";
import Dialog from "material-ui/Dialog";
import { Toolbar, ToolbarGroup, ToolbarTitle } from "material-ui/Toolbar";
import PropTypes from "prop-types";
import * as React from "react";

import theme from "../theme";
import AddFileMutation from "../mutations/AddFile";
import SaveFilePermissionsMutation from "../mutations/SaveFilePermissions";

import FileList from "./FileList";
import FileUpload from "./FileUpload";
import TagField from "./TagField";

type Props = {
  organization: {
    files: {
      edges: Array<{
        node: {
          id: string,
        },
      }>,
      pageInfo: {
        hasNextPage: boolean,
      },
    },
    isMember: boolean,
    memberGroup: {
      id: string,
    },
  },
  relay: RelayRefetchProp,
  viewer: {},
};

type State = {
  addFile: boolean,
  search: boolean,
  tags: string[],
};

class Files extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    addFile: false,
    search: false,
    tags: [],
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onDrop = (files, permissions, tags) => {
    const { relay } = this.props;
    files.forEach((file) => {
      const data = new FormData();
      data.append("file", file);

      axios
        .post("/upload", data)
        .then((response) => {
          AddFileMutation.commit(relay.environment, {
            filename: file.name,
            hex: response.data.hex,
            permissions: permissions.map((permission) => {
              return permission.id;
            }),
            projectTag: null,
            tags,
          });
        })
        .catch((error) => {
          console.error("err", error);
        });
    });
  };

  onSaveFilePermissions = (file, permissions, tags, onSuccess) => {
    const { relay } = this.props;
    SaveFilePermissionsMutation.commit(
      relay.environment,
      {
        fileId: file,
        permissions: permissions.map((permission) => {
          return permission.id;
        }),
        tags,
      },
      onSuccess,
    );
  };

  onTagChange = (tags) => {
    this.setState({ tags });
    this.props.relay.refetch((variables) => {
      variables.searchTags = tags
        .sort()
        .join("|")
        .toLowerCase();
      return variables;
    });
  };

  onChangeTerm = (searchTerm) => {
    this.props.relay.refetch((variables) => {
      variables.searchTerm = searchTerm;
      return variables;
    });
  };

  muiTheme: {};

  toggleAddFile = () => {
    this.setState({ addFile: !this.state.addFile });
  };

  closeAddFile = () => {
    this.setState({ addFile: false });
  };

  toggleSearch = () => {
    this.setState({ search: !this.state.search });
  };

  searchTag = (tag) => {
    // const fixedTags = tags.sort().join('|').toLowerCase();
    const { tags } = this.state;
    tags.push(tag);
    this.props.relay.refetch((variables) => {
      this.setState({
        search: true,
        tags,
      });
      variables.searchTags = this.state.tags
        .sort()
        .join("|")
        .toLowerCase();
      return variables;
    });
  };

  fetchMore = () => {
    const { files } = this.props.organization;
    this.props.relay.refetch((variables) => {
      variables.showFiles = files.edges.length + 20;
      variables.searchTags = this.state.tags
        .sort()
        .join("|")
        .toLowerCase();
      variables.searchTerm = variables.searchTerm;
      return variables;
    });
  };

  render() {
    const { organization } = this.props;
    const { isMember } = organization;
    const { desktopGutterLess } = theme.spacing;
    return (
      <div>
        <div className="row">
          {isMember ? (
            <Toolbar style={{ height: 106, backgroundColor: "none" }}>
              <ToolbarGroup firstChild>
                <ToolbarTitle
                  text="Filer"
                  style={{ color: theme.palette.textColor }}
                />
              </ToolbarGroup>
              <ToolbarGroup lastChild>
                <TagField
                  autoFocus
                  fileTags={this.state.tags}
                  onChange={this.onTagChange}
                  organization={this.props.organization}
                />
                <RaisedButton
                  label="Last opp filer"
                  onTouchTap={this.toggleAddFile}
                />
                <Dialog
                  title="Last opp filer"
                  open={this.state.addFile}
                  onRequestClose={this.closeAddFile}
                  autoScrollBodyContent
                >
                  <FileUpload
                    viewer={this.props.viewer}
                    organization={this.props.organization}
                    onDrop={this.onDrop}
                    memberGroupId={organization.memberGroup.id}
                    onTagsChange={this.searchTag}
                  />
                  <RaisedButton
                    label="Ferdig"
                    primary
                    onTouchTap={this.closeAddFile}
                  />
                </Dialog>
              </ToolbarGroup>
            </Toolbar>
          ) : null}
          {isMember ? null : <h1>Filer</h1>}
          <FileList
            files={organization.files}
            memberGroupId={organization.memberGroup.id}
            onSavePermissions={this.onSaveFilePermissions}
            searchTag={this.searchTag}
            style={{
              marginLeft: -desktopGutterLess,
              marginRight: -desktopGutterLess,
            }}
            viewer={this.props.viewer}
            organization={this.props.organization}
          />
          {organization.files.pageInfo.hasNextPage ? (
            <RaisedButton onTouchTap={this.fetchMore} label="Mer" primary />
          ) : null}
        </div>
      </div>
    );
  }
}

export default createRefetchContainer(
  Files,
  {
    viewer: graphql`
      fragment Files_viewer on User {
        groups {
          id
          name
        }
      }
    `,
    organization: graphql`
      fragment Files_organization on Organization
        @argumentDefinitions(
          showFiles: { type: "Int", defaultValue: 20 }
          searchTags: { type: "String", defaultValue: "" }
          searchTerm: { type: "String", defaultValue: "" }
        ) {
        id
        isMember
        memberGroup {
          id
        }
        files(first: $showFiles, tags: $searchTags) {
          edges {
            node {
              id
              filename
              created
              mimetype
              size
              permissions {
                public
                groups {
                  id
                  name
                }
                users {
                  id
                  name
                }
              }
              tags
              isImage
              path
              thumbnailPath
            }
          }
          pageInfo {
            hasNextPage
          }
        }
        ...FileList_organization
        ...FileUpload_organization
        ...TagField_organization
      }
    `,
  },
  graphql`
    query FilesRefetchQuery($showFiles: Int, $searchTags: String) {
      organization {
        ...Files_organization
          @arguments(showFiles: $showFiles, searchTags: $searchTags)
      }
    }
  `,
);
