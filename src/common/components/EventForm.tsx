/* eslint "no-nested-ternary": 0 */

import MomentUtils from "@date-io/moment";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import {
  DatePicker,
  MuiPickersUtilsProvider,
  TimePicker,
} from "@material-ui/pickers";
import moment from "moment";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { PermissionArray, PermissionObject } from "../types";
import { flattenPermissions } from "../utils";
import PermissionField from "./PermissionField";
import ProjectField from "./ProjectField";
import { EventForm_organization } from "./__generated__/EventForm_organization.graphql";
import { EventForm_viewer } from "./__generated__/EventForm_viewer.graphql";

interface ProjectOption {
  id: string;
  tag: string;
}

type Props = {
  title: string;
  event: {
    id: string;
    title: string;
    location: string;
    start: moment.Moment;
    end: moment.Moment;
    mdtext: string;
    highlighted: boolean;
    permissions: PermissionObject;
    projects: Array<{
      id: string;
      tag: string;
    }>;
  };
  viewer: EventForm_viewer;
  organization: EventForm_organization;
  isOpen: boolean;
  save: ({}) => void;
  cancel: () => void;
  projectPermissions: PermissionObject;
  highlighted: boolean;
};

type State = {
  id?: string;
  title: string;
  location: string;
  start: moment.Moment | null;
  end: moment.Moment | null;
  mdtext: string;
  permissions: PermissionArray;
  projects: Array<{
    id: string;
    tag: string;
  }>;
  tags: Array<string>;
  highlighted: boolean;
};

class EventForm extends React.Component<Props, State> {
  state = {
    id: this.props.event ? this.props.event.id : undefined,
    title: this.props.event ? this.props.event.title : "",
    location: this.props.event ? this.props.event.location : "",
    start:
      this.props.event && this.props.event.start
        ? moment(this.props.event.start)
        : null,
    end:
      this.props.event && this.props.event.end
        ? moment(this.props.event.end)
        : null,
    mdtext: this.props.event ? this.props.event.mdtext : "",
    permissions: this.props.event
      ? this.props.event.permissions
        ? flattenPermissions(this.props.event.permissions)
        : []
      : this.props.projectPermissions
      ? flattenPermissions(this.props.projectPermissions)
      : [],
    projects: this.props.event ? this.props.event.projects : [],
    highlighted: !!(this.props.event && this.props.event.highlighted),
    tags: [],
  };

  onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  };

  onChangeLocation = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ location: event.target.value });
  };

  onChangeStart = (start: moment.Moment | null) => {
    this.setState({ start });
  };
  onChangeEnd = (end: moment.Moment | null) => {
    this.setState({ end });
  };

  onChangeStartDate = (start: moment.Moment | null) => {
    if (!this.state.start) {
      this.setState({ start });
    } else {
      this.setState({
        start: start
          ? moment(this.state.start).set({
              year: start.year(),
              month: start.month(),
              date: start.date(),
            })
          : null,
      });
    }
  };

  onChangeEndDate = (end: moment.Moment | null) => {
    if (!this.state.end) {
      this.setState({ end });
    } else {
      this.setState({
        end: end
          ? moment(this.state.end).set({
              year: end.year(),
              month: end.month(),
              date: end.date(),
            })
          : null,
      });
    }
  };

  onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ mdtext: event.target.value });
  };

  onChangePermissions = (permissions: PermissionArray) => {
    this.setState({ permissions });
  };

  onChangeProjects = (projects: ProjectOption[]) => {
    this.setState({ projects });
  };

  onChangeHighlighted = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ highlighted: event.target.checked });
  };

  save = () => {
    const {
      id,
      title,
      location,
      start,
      end,
      mdtext,
      permissions,
      projects,
      highlighted,
    } = this.state;
    return this.props.save({
      id,
      title,
      location,
      start,
      end,
      mdtext,
      permissions: permissions.map((p) => {
        return p.id;
      }),
      tags: projects.map((p) => {
        return p.tag;
      }),
      highlighted,
    });
  };

  renderChip = (data: string, key: string) => {
    return <Chip key={key} label={data} />;
  };

  render() {
    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Dialog
          title={this.props.title}
          open={this.props.isOpen}
          onClose={this.props.cancel}
        >
          <DialogTitle>
            {this.props.id ? "Rediger aktivitet" : "Ny aktivitet"}
          </DialogTitle>
          <DialogContent>
            <div>
              <TextField
                value={this.state.title}
                label="Tittel"
                onChange={this.onChangeTitle}
                required
                name="title"
              />
            </div>
            <div>
              <TextField
                value={this.state.location}
                label="Sted"
                onChange={this.onChangeLocation}
              />
            </div>
            <div className="small-narrow" style={{ display: "flex" }}>
              <DatePicker
                value={this.state.start}
                label="Start"
                onChange={this.onChangeStartDate}
                style={{ flex: "1 1 auto" }}
                autoOk
                required
                className="event-start"
              />
              <TimePicker
                value={this.state.start}
                clearable
                label="Klokkeslett"
                ampm={false}
                onChange={this.onChangeStart}
                style={{ flex: "1 1 auto" }}
              />
            </div>
            <div className="small-narrow" style={{ display: "flex" }}>
              <DatePicker
                value={this.state.end}
                label="Slutt"
                onChange={this.onChangeEndDate}
                style={{ flex: "1 1 auto" }}
                autoOk
                clearable
              />
              <TimePicker
                value={this.state.end}
                label="Klokkeslett"
                ampm={false}
                onChange={this.onChangeEnd}
                style={{ flex: "1 1 auto" }}
                clearable
              />
            </div>
            <div>
              <TextField
                value={this.state.mdtext}
                label="Beskrivelse"
                multiline
                fullWidth
                onChange={this.onChangeDescription}
                name="description"
              />
            </div>
            <div>
              <ProjectField
                projects={this.state.projects}
                organization={this.props.organization}
                onChange={this.onChangeProjects}
              />
            </div>
            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    id="member"
                    name="member"
                    checked={this.state.highlighted}
                    onChange={this.onChangeHighlighted}
                    color="primary"
                  />
                }
                label="Konsert eller noe annet publikum bør vite om"
              ></FormControlLabel>
            </div>
            <div>
              {this.state.tags
                ? this.state.tags.map((tag, i) => {
                    return this.renderChip(tag, i);
                  })
                : null}
            </div>
            <div>
              <PermissionField
                permissions={this.state.permissions}
                onChange={this.onChangePermissions}
                groups={this.props.viewer.groups}
                users={[]}
                fullWidth
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button variant="text" onClick={this.props.cancel}>
              Avbryt
            </Button>
            <Button
              variant="text"
              onClick={this.save}
              color="primary"
              className="event-form-submit"
            >
              Lagre
            </Button>
          </DialogActions>
        </Dialog>
      </MuiPickersUtilsProvider>
    );
  }
}

export default createFragmentContainer(EventForm, {
  organization: graphql`
    fragment EventForm_organization on Organization {
      id
      ...ProjectField_organization
    }
  `,
  viewer: graphql`
    fragment EventForm_viewer on User {
      id
      groups {
        id
        name
      }
    }
  `,
});
