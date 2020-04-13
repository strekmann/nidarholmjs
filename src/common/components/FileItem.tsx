import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import Chip from "@material-ui/core/Chip";
import grey from "@material-ui/core/colors/grey";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import withStyles from "@material-ui/core/styles/withStyles";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import Download from "@material-ui/icons/PlayForWork";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { PermissionArray, PermissionObject } from "../types";
import { flattenPermissions } from "../utils";
import PermissionChips from "./PermissionChips";
import PermissionField from "./PermissionField";
import TagField from "./TagField";
import { FileItem_organization } from "./__generated__/FileItem_organization.graphql";

type Props = {
  classes: any,
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
    const { classes } = this.props;
    return (
      <Card className={classes.root} key={this.props.id}>
        <CardHeader
          action={
            <IconButton onClick={this.onMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          }
          title={this.props.filename}
        />
        {this.props.isImage ? (
          <CardMedia
            image={this.props.thumbnailPath}
            component="img"
            className={classes.media}
          />
        ) : (
          <a
            style={{ display: "block", textAlign: "center" }}
            href={this.props.path}
            download
          >
            <Download className={classes.downloadIcon} />
          </a>
        )}
        <CardActionArea style={{ paddingBottom: 0 }}>
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
          {this.state.editPermissions ? (
            <Dialog
              open={this.state.editPermissions}
              onClose={this.closeEditPermissions}
            >
              <DialogTitle>Rediger rettigheter</DialogTitle>
              <DialogContent>
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
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  onClick={this.savePermissions}
                  color="primary"
                >
                  Lagre
                </Button>
              </DialogActions>
            </Dialog>
          ) : null}
        </CardActionArea>
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
      </Card>
    );
  }
}

const useStyles = () => {
  return {
    root: {
      width: 300,
      marginLeft: 10,
      marginRight: 10,
      marginBottom: 10,
    },
    media: {
      maxHeight: 168,
    },
    downloadIcon: { height: 168, width: "100%", color: grey[500] },
  };
};

export default withStyles(useStyles)(
  createFragmentContainer(FileItem, {
    organization: graphql`
      fragment FileItem_organization on Organization {
        ...TagField_organization
      }
    `,
  }),
);
