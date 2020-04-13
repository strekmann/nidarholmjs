/* global FormData */

import { Theme, withStyles } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import axios from "axios";
import React from "react";
import Helmet from "react-helmet";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import AddEventMutation from "../mutations/AddEvent";
import AddPieceMutation from "../mutations/AddPiece";
import AddProjectFileMutation from "../mutations/AddProjectFile";
import RemovePieceMutation from "../mutations/RemovePiece";
import SaveFilePermissionsMutation from "../mutations/SaveFilePermissions";
import SaveProjectMutation from "../mutations/SaveProject";
import SetProjectPosterMutation from "../mutations/SetProjectPoster";
import { flattenPermissions } from "../utils";
import Daterange from "./Daterange";
import EventForm from "./EventForm";
import EventItem from "./EventItem";
import FileList from "./FileList";
import FileUpload from "./FileUpload";
import List from "./List";
import MusicList from "./MusicList";
import PermissionChips from "./PermissionChips";
import ProjectForm from "./ProjectForm";
import ProjectPieceForm from "./ProjectPieceForm";
import Text from "./Text";
import { Project_organization } from "./__generated__/Project_organization.graphql";
import { Project_viewer } from "./__generated__/Project_viewer.graphql";

type Props = {
  organization: Project_organization,
  viewer: Project_viewer,
  relay: RelayProp,
  theme: Theme,
};

type State = {
  public: boolean,
  addEvent: boolean,
  addFile: boolean,
  addPiece: boolean,
  editProject: boolean,
  menuIsOpen: null | HTMLElement,
  showEnded: boolean,
};

export class Project extends React.Component<Props, State> {
  state = {
    public: false,
    menuIsOpen: null,
    addEvent: false,
    addFile: false,
    addPiece: false,
    editProject: false,
    showEnded: false,
  };

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  onDrop = (files, permissions, tags) => {
    const { organization, relay } = this.props;

    files.forEach((file) => {
      const data = new FormData();
      data.append("file", file);

      axios.post("/upload", data).then((response) => {
        tags.push(organization.project.tag);
        AddProjectFileMutation.commit(
          relay.environment,
          {
            hex: response.data.hex,
            permissions: permissions.map((permission) => {
              return permission.id;
            }),
            tags,
            filename: file.name,
            projectTag: organization.project.tag,
          },
          undefined,
        );
      });
    });
  };

  onSetProjectPoster = (fileId) => {
    const { organization, relay } = this.props;
    SetProjectPosterMutation.commit(
      relay.environment,
      {
        fileId,
        projectId: organization.project.id,
      },
      undefined,
    );
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

  openAddPiece = () => {
    this.setState({ addPiece: true, menuIsOpen: null });
  };

  closeAddPiece = () => {
    this.setState({ addPiece: false });
  };

  togglePublic = () => {
    const { public: pub } = this.state;
    this.setState({ public: !pub });
  };

  openAddEvent = () => {
    this.setState({ addEvent: true, menuIsOpen: null });
  };
  closeAddEvent = () => {
    this.setState({ addEvent: false });
  };

  openEditProject = () => {
    this.setState({ editProject: true, menuIsOpen: null });
  };

  closeEditProject = () => {
    this.setState({ editProject: false });
  };

  openAddFile = () => {
    this.setState({ addFile: true, menuIsOpen: null });
  };
  closeAddFile = () => {
    this.setState({ addFile: false });
  };

  addPiece = (piece) => {
    const { organization, relay } = this.props;
    const { project } = organization;
    this.closeAddPiece();
    AddPieceMutation.commit(
      relay.environment,
      {
        pieceId: piece.id,
        projectId: project.id,
      },
      undefined,
    );
  };

  removePiece = (piece) => {
    const { organization, relay } = this.props;
    const { project } = organization;
    RemovePieceMutation.commit(
      relay.environment,
      {
        pieceId: piece.id,
        projectId: project.id,
      },
      undefined,
    );
  };

  addEvent = (event) => {
    const { organization, relay } = this.props;
    this.setState({ addEvent: false });
    AddEventMutation.commit(
      relay.environment,
      {
        title: event.title,
        location: event.location,
        start: event.start,
        end: event.end,
        tags: [organization.project.tag],
        mdtext: event.mdtext,
        permissions: event.permissions,
        highlighted: event.highlighted,
      },
      undefined,
    );
  };

  saveProject = (project, callbacks) => {
    const { relay } = this.props;
    SaveProjectMutation.commit(relay.environment, project, () => {
      if (callbacks && callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    });
  };

  showEnded = () => {
    this.setState({ showEnded: true });
  };

  searchPiece = (searchTerm) => {
    const { relay } = this.props;
    relay.refetch((variables) => {
      variables.searchTerm = searchTerm;
      return variables;
    });
  };

  render() {
    const { organization, theme, viewer } = this.props;
    const {
      project,
      isMember,
      isMusicAdmin,
      memberGroup,
      baseurl,
    } = organization;
    const { addEvent, addFile, addPiece, showEnded, editProject } = this.state;
    let hasEndedActivities = false;
    if (project && project.events.length) {
      hasEndedActivities =
        project.events.edges.filter((edge) => {
          return edge.node.isEnded;
        }).length > 0;
    }
    return (
      <Paper className="row">
        <Helmet
          title={project.title}
          meta={[
            { property: "og:title", content: project.title },
            { property: "og:description", content: project.publicMdtext },
            {
              property: "og:image",
              content: project.poster
                ? `${baseurl}/${project.poster.largePath}`
                : "",
            },
            {
              property: "og:url",
              content: `${baseurl}/${project.year}/${project.tag}`,
            },
          ]}
        />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1>{project.title}</h1>
            <div className="meta">
              <Daterange start={project.start} end={project.end} noTime />
            </div>
            {project.conductors.length ? (
              <p>
                Dirigent:{" "}
                <List
                  items={project.conductors.map((conductor) => {
                    return conductor.name;
                  })}
                />
              </p>
            ) : null}
            {project.managers.length ? (
              <p>
                Prosjektleder:{" "}
                <List
                  items={project.managers.map((manager) => {
                    return manager.name;
                  })}
                />
              </p>
            ) : null}
          </div>
          {isMember ? (
            <div>
              <IconButton onClick={this.onMenuOpen}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={this.state.menuIsOpen}
                onClose={this.onMenuClose}
                open={Boolean(this.state.menuIsOpen)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {hasEndedActivities ? (
                  <MenuItem onClick={this.showEnded}>
                    Vis tidligere aktiviteter
                  </MenuItem>
                ) : null}
                <MenuItem onClick={this.openEditProject}>
                  Rediger prosjektinfo
                </MenuItem>
                <MenuItem onClick={this.openAddEvent}>
                  Legg til aktivitet
                </MenuItem>
                {isMusicAdmin ? (
                  <MenuItem onClick={this.openAddPiece}>
                    Legg til repertoar
                  </MenuItem>
                ) : null}
                <MenuItem onClick={this.openAddFile}>Last opp filer</MenuItem>
              </Menu>
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            marginLeft: -theme.spacing(2),
            marginRight: -theme.spacing(2),
          }}
        >
          <div
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              width: "100%",
            }}
          >
            <PermissionChips
              permissions={flattenPermissions(project.permissions)}
              memberGroupId={memberGroup.id}
            />
            {project.publicMdtext ? (
              <div>
                <h2>Informasjon</h2>
                <Text text={project.publicMdtext} />
              </div>
            ) : null}
            {isMember && project.privateMdtext ? (
              <div>
                <h2>Intern informasjon</h2>
                <Text text={project.privateMdtext} />
              </div>
            ) : null}
            {project.music.length ? (
              <div>
                <h2>Repertoar</h2>
                <MusicList
                  music={project.music}
                  isMember={isMember}
                  isMusicAdmin={isMusicAdmin}
                  remove={this.removePiece}
                />
              </div>
            ) : null}
            {isMember && project.files.edges.length ? (
              <FileList
                files={project.files}
                memberGroupId={memberGroup.id}
                onSavePermissions={this.onSaveFilePermissions}
                onSetProjectPoster={this.onSetProjectPoster}
                style={{
                  marginLeft: -theme.spacing(2),
                  marginRight: -theme.spacing(2),
                }}
                title="Prosjektfiler"
                viewer={viewer}
                organization={organization}
              />
            ) : null}
          </div>
          <div
            style={{
              width: 300,
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
            }}
          >
            {project.poster ? (
              <img
                alt="Konsertplakat"
                src={project.poster.largePath}
                className="responsive"
              />
            ) : null}
            {project.events.edges.length ? (
              <div id="eventList">
                {project.events.edges
                  .filter((edge) => {
                    return showEnded || !edge.node.isEnded;
                  })
                  .map((edge) => {
                    return <EventItem key={edge.node.id} event={edge.node} />;
                  })}
              </div>
            ) : null}
          </div>
        </div>
        {isMember ? (
          <div>
            <ProjectForm
              open={editProject}
              save={this.saveProject}
              onClose={this.closeEditProject}
              viewer={viewer}
              organization={organization}
              {...project}
            />
            <EventForm
              title="Legg til aktivitet"
              isOpen={addEvent}
              save={this.addEvent}
              cancel={this.closeAddEvent}
              projectPermissions={{ public: true, groups: [], users: [] }}
              viewer={viewer}
              organization={null}
            />
            <Dialog open={addFile} onClose={this.closeAddFile}>
              <DialogTitle>Last opp filer</DialogTitle>
              <DialogContent>
                <FileUpload
                  viewer={viewer}
                  organization={organization}
                  onDrop={this.onDrop}
                  permissions={flattenPermissions(project.permissions)}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.closeAddFile}
                >
                  Ferdig
                </Button>
              </DialogActions>
            </Dialog>
            <ProjectPieceForm
              open={addPiece}
              organization={organization}
              onClose={this.closeAddPiece}
              save={this.addPiece}
            />
          </div>
        ) : null}
      </Paper>
    );
  }
}

export default withStyles(
  createFragmentContainer(Project, {
    organization: graphql`
      fragment Project_organization on Organization {
        name
        isMember
        isMusicAdmin
        memberGroup {
          id
        }
        baseurl
        project(year: $year, tag: $tag) {
          id
          title
          tag
          start
          end
          year
          publicMdtext
          privateMdtext
          conductors {
            id
            name
          }
          managers {
            id
            name
          }
          poster {
            filename
            largePath
          }
          events(first: 100) {
            edges {
              node {
                id
                isEnded
                ...EventItem_event
              }
            }
          }
          files(first: 100) {
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
                thumbnailPath
                path
              }
            }
          }
          music {
            id
            piece {
              id
              title
              composers
            }
          }
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
        }
        ...ProjectPieceForm_organization
        ...FileList_organization
        ...FileUpload_organization
        ...ProjectForm_organization
      }
    `,
    viewer: graphql`
      fragment Project_viewer on User {
        ...EventForm_viewer
        ...ProjectForm_viewer
      }
    `,
  }),
);
