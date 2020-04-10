import { Card, CardTitle, CardMedia, CardActions } from "material-ui/Card";
import Chip from "@material-ui/core/Chip";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import Dialog from "material-ui/Dialog";
import Download from "material-ui/svg-icons/file/file-download";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import { grey400 } from "material-ui/styles/colors";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { flattenPermissions } from "../utils";
import theme from "../theme";
import { PermissionArray, PermissionObject, Viewer } from "../types";
import { FileItem_organization } from "./__generated__/FileItem_organization.graphql";

import PermissionChips from "./PermissionChips";
import PermissionField from "./PermissionField";
import TagField from "./TagField";

type Props = {
  id: string,
  filename: string,
  isImage: boolean,
  memberGroupId: string,
  onSavePermissions: any, //(string, PermissionArray, string[], () => void) => {},
  onSetProjectPoster: (string) => {},
  organization: FileItem_organization,
  permissions: PermissionObject,
  path: string,
  searchTag: (string) => {},
  tags: string[],
  thumbnailPath: string,
  viewer: any, //FileItem_viewer;
};

type State = {
  editPermissions: boolean,
  menuIsOpen: null | HTMLElement,
  permissions: PermissionArray,
  tags: string[],
};

class FileItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editPermissions: false,
      menuIsOpen: null,
      permissions: flattenPermissions(props.permissions),
      tags: props.tags || [],
    };
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  onPermissionChange = (permissions) => {
    this.setState({ permissions });
  };

  onTagChange = (tags) => {
    this.setState({ tags });
  };

  setProjectPoster = () => {
    this.props.onSetProjectPoster(this.props.id);
  };

  savePermissions = (event) => {
    event.preventDefault();
    this.props.onSavePermissions(
      this.props.id,
      this.state.permissions,
      this.state.tags,
      () => {
        this.setState({
          editPermissions: false,
        });
      },
    );
  };

  closeEditPermissions = () => {
    this.setState({
      editPermissions: false,
    });
  };

  toggleEditPermissions = () => {
    this.setState({
      editPermissions: !this.state.editPermissions,
    });
  };

  searchTag = (tag) => {
    this.props.searchTag(tag);
  };

  render() {
    const { desktopGutterLess } = theme.spacing;
    return (
      <Card
        key={this.props.id}
        style={{
          width: 216,
          marginLeft: desktopGutterLess,
          marginRight: desktopGutterLess,
          marginBottom: desktopGutterLess,
        }}
      >
        <CardTitle style={{ paddingBottom: 0 }}>
          <div style={{ float: "right" }}>
            <IconButton
              onClick={this.onMenuOpen}
              style={{ padding: 0, height: "inherit", width: "inherit" }}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={this.state.menuIsOpen}
              onClose={this.onMenuClose}
              open={Boolean(this.state.menuIsOpen)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={this.toggleEditPermissions}>
                Rediger filegenskaper
              </MenuItem>
              {this.props.onSetProjectPoster ? (
                <MenuItem onClick={this.setProjectPoster}>
                  Bruk som prosjektplakat
                </MenuItem>
              ) : null}
            </Menu>
          </div>
          <span
            style={{
              textOverflow: "ellipsis",
              overflow: "hidden",
            }}
          >
            {this.props.filename}
          </span>
        </CardTitle>
        {this.props.isImage ? (
          <CardMedia>
            <img alt="" src={this.props.thumbnailPath} />
          </CardMedia>
        ) : (
          <a
            style={{ display: "block", textAlign: "center" }}
            href={this.props.path}
            download
          >
            <Download style={{ height: 100, width: "100%" }} color={grey400} />
          </a>
        )}
        <CardActions style={{ display: "flex", flexWrap: "wrap" }}>
          <PermissionChips
            memberGroupId={this.props.memberGroupId}
            permissions={flattenPermissions(this.props.permissions)}
          />
          {this.props.tags &&
            this.props.tags.map((tag) => {
              return (
                <Chip
                  key={tag}
                  onClick={() => {
                    this.searchTag(tag);
                  }}
                  label={tag}
                />
              );
            })}
        </CardActions>
        {this.state.editPermissions ? (
          <Dialog
            title="Rediger rettigheter"
            open={this.state.editPermissions}
            onRequestClose={this.closeEditPermissions}
            autoScrollBodyContent
          >
            <PermissionField
              permissions={this.state.permissions}
              onChange={this.onPermissionChange}
              groups={this.props.viewer.groups}
              users={[]}
            />
            <TagField
              organization={this.props.organization}
              onChange={this.onTagChange}
              fileTags={this.state.tags}
            />
            <Button
              variant="contained"
              onClick={this.savePermissions}
              color="primary"
            >
              Lagre
            </Button>
          </Dialog>
        ) : null}
      </Card>
    );
  }
}

export default createFragmentContainer(FileItem, {
  organization: graphql`
    fragment FileItem_organization on Organization {
      ...TagField_organization
    }
  `,
});
