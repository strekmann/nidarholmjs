/* global FormData */
/* eslint "no-console": 0 */

import { RelayRefetchProp } from "react-relay";
import { createRefetchContainer, graphql } from "react-relay";
import axios from "axios";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import * as React from "react";

import AddFileMutation from "../mutations/AddFile";
import SaveFilePermissionsMutation from "../mutations/SaveFilePermissions";

import FileList from "./FileList";
import FileUpload from "./FileUpload";
import TagField from "./TagField";
import { Files_organization } from "./__generated__/Files_organization.graphql";

type Props = {
  organization: Files_organization,
  relay: RelayRefetchProp,
  viewer: {},
};

type State = {
  addFile: boolean,
  search: boolean,
  tags: string[],
};

class Files extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  state = {
    addFile: false,
    search: false,
    tags: [],
  };

  onDrop = (files, permissions, tags) => {
    const { relay } = this.props;
    files.forEach((file) => {
      const data = new FormData();
      data.append("file", file);

      axios
        .post("/upload", data)
        .then((response) => {
          AddFileMutation.commit(
            relay.environment,
            {
              filename: file.name,
              hex: response.data.hex,
              permissions: permissions.map((permission) => {
                return permission.id;
              }),
              projectTag: null,
              tags,
            },
            undefined,
          );
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
      variables.searchTags = tags.sort().join("|").toLowerCase();
      return variables;
    });
  };

  onChangeTerm = (searchTerm) => {
    this.props.relay.refetch((variables) => {
      variables.searchTerm = searchTerm;
      return variables;
    });
  };

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
      variables.searchTags = this.state.tags.sort().join("|").toLowerCase();
      return variables;
    });
  };

  fetchMore = () => {
    const { files } = this.props.organization;
    this.props.relay.refetch((variables) => {
      variables.showFiles = files.edges.length + 20;
      variables.searchTags = this.state.tags.sort().join("|").toLowerCase();
      variables.searchTerm = variables.searchTerm;
      return variables;
    });
  };

  render() {
    const { organization } = this.props;
    const { isMember } = organization;
    return (
      <div>
        {isMember ? (
          <Toolbar style={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h1">Filer</Typography>
            <TagField
              autoFocus
              fileTags={this.state.tags}
              onChange={this.onTagChange}
              organization={this.props.organization}
              fullWidth
              style={{ flexGrow: 1, marginRight: 20, marginLeft: 20 }}
            />
            <Button variant="contained" onClick={this.toggleAddFile}>
              Last opp filer
            </Button>
            <Dialog open={this.state.addFile} onClose={this.closeAddFile}>
              <DialogTitle>Last opp filer</DialogTitle>
              <DialogContent>
                <FileUpload
                  viewer={this.props.viewer}
                  organization={this.props.organization}
                  onDrop={this.onDrop}
                  memberGroupId={organization.memberGroup.id}
                  onTagsChange={this.searchTag}
                />
              </DialogContent>
              <DialogActions>
                <Button color="primary" onClick={this.closeAddFile}>
                  Ferdig
                </Button>
              </DialogActions>
            </Dialog>
          </Toolbar>
        ) : null}
        {isMember ? null : <h1>Filer</h1>}
        <FileList
          files={organization.files}
          memberGroupId={organization.memberGroup.id}
          onSavePermissions={this.onSaveFilePermissions}
          searchTag={this.searchTag}
          viewer={this.props.viewer}
          organization={this.props.organization}
        />
        {organization.files.pageInfo.hasNextPage ? (
          <Button variant="contained" onClick={this.fetchMore} color="primary">
            Mer
          </Button>
        ) : null}
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
