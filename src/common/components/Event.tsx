import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import { DialogActions, DialogContent, DialogTitle } from "@material-ui/core";

import DeleteEventMutation from "../mutations/DeleteEvent";
import EditEventMutation from "../mutations/EditEvent";
import { Event as EventType, Project } from "../types";

import Daterange from "./Daterange";
import EventForm from "./EventForm";
import Text from "./Text";
import { Event_organization as EventOrganization } from "./__generated__/Event_organization.graphql";
import { Event_viewer as EventViewer } from "./__generated__/Event_viewer.graphql";

type Props = {
  organization: EventOrganization;
  relay: RelayProp;
  router: {
    go: (_: number) => void;
    push: any; // ({ pathname: string }) => void;
  };
  viewer: EventViewer;
};

type State = {
  editing: boolean;
  deleting: boolean;
  menuIsOpen: null | HTMLElement;
};

class Event extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editing: false,
      deleting: false,
      menuIsOpen: null,
    };
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };

  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  toggleEdit = () => {
    const { editing } = this.state;
    this.setState({
      editing: !editing,
      menuIsOpen: null,
    });
  };

  toggleDelete = () => {
    const { deleting } = this.state;
    this.setState({ deleting: !deleting, menuIsOpen: null });
  };

  closeEdit = () => {
    this.setState({
      editing: false,
    });
  };

  closeDelete = () => {
    this.setState({ deleting: false });
  };

  saveEvent = (event: EventType) => {
    const { relay } = this.props;
    this.setState({ editing: false });
    EditEventMutation.commit(
      relay.environment,
      {
        eventid: event.id,
        title: event.title,
        location: event.location,
        start: event.start,
        end: event.end,
        mdtext: event.mdtext,
        permissions: event.permissions,
        tags: event.tags,
        highlighted: event.highlighted,
      },
      undefined,
    );
  };

  deleteEvent = () => {
    const { organization, relay, router } = this.props;
    const { event } = organization;
    if (!event) {
      throw new Error("Event not defined");
    }
    const { id } = event;
    DeleteEventMutation.commit(
      relay.environment,
      {
        id,
      },
      () => {
        router.go(-1);
      },
    );
  };

  goTo = (project: Project) => {
    const { router } = this.props;
    const { year, tag } = project;
    if (year && tag) {
      router.push({ pathname: `/${year}/${tag}` });
    }
  };

  render() {
    const { organization, viewer } = this.props;
    const { event, isMember } = organization;
    const { menuIsOpen, deleting, editing } = this.state;
    if (!event) {
      throw new Error("Event not defined");
    }
    return (
      <Paper className="row event">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>{event.title}</h1>
          {isMember ? (
            <div>
              <IconButton onClick={this.onMenuOpen} className="context-menu">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuIsOpen}
                onClose={this.onMenuClose}
                open={Boolean(menuIsOpen)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={this.toggleEdit} className="event-edit">
                  Rediger
                </MenuItem>
                <MenuItem onClick={this.toggleDelete} className="event-delete">
                  Slett
                </MenuItem>
              </Menu>
            </div>
          ) : null}
        </div>
        <div className="meta">
          {event.location} <Daterange start={event.start} end={event.end} />
        </div>
        <Text text={event.mdtext} />
        {event.projects &&
          event.projects.map((project) => {
            if (!project) {
              return null;
            }
            return (
              <Chip
                key={project.id}
                onClick={() => {
                  this.goTo(project);
                }}
                label={project.title}
              />
            );
          })}
        {isMember ? (
          <div>
            <EventForm
              event={event}
              organization={organization}
              viewer={viewer}
              isOpen={editing}
              title="Rediger aktivitet"
              save={this.saveEvent}
              cancel={this.closeEdit}
            />
            <Dialog open={deleting} onClose={this.closeDelete}>
              <DialogTitle>Slett aktivitet</DialogTitle>
              <DialogContent>
                <p>{event.title}</p>
              </DialogContent>
              <DialogActions>
                <Button variant="text" onClick={this.closeDelete}>
                  Avbryt
                </Button>
                <Button
                  variant="text"
                  color="primary"
                  onClick={this.deleteEvent}
                  className="event-delete-confirm"
                >
                  Slett
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        ) : null}
      </Paper>
    );
  }
}

export default createFragmentContainer(Event, {
  viewer: graphql`
    fragment Event_viewer on User {
      id
      ...EventForm_viewer
    }
  `,
  organization: graphql`
    fragment Event_organization on Organization {
      isMember
      event(eventid: $eventId) {
        id
        title
        location
        start
        end
        projects {
          id
          year
          tag
          title
        }
        mdtext
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
        highlighted
      }
      ...EventForm_organization
    }
  `,
});
