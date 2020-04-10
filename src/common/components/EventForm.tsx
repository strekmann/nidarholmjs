/* eslint "no-nested-ternary": 0 */

import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TextField from "@material-ui/core/TextField";
import DatePicker from "material-ui/DatePicker";
import TimePicker from "material-ui/TimePicker";
import moment from "moment";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { flattenPermissions } from "../utils";
import { PermissionArray, PermissionObject } from "../types";

import { EventForm_organization } from "./__generated__/EventForm_organization.graphql";
import { EventForm_viewer } from "./__generated__/EventForm_viewer.graphql";
import PermissionField from "./PermissionField";
import ProjectField from "./ProjectField";

type Props = {
  title: string,
  event: {
    id: string,
    title: string,
    location: string,
    start: any,
    end: any,
    mdtext: string,
    highlighted: boolean,
    permissions: PermissionObject,
    projects: Array<{
      id: string,
      tag: string,
    }>,
  },
  viewer: EventForm_viewer,
  organization: EventForm_organization,
  isOpen: boolean,
  save: ({}) => void,
  cancel: () => void,
  projectPermissions: {},
  highlighted: boolean,
};

type State = {
  id?: string,
  title: string,
  location: string,
  start: any,
  end: any,
  mdtext: string,
  permissions: PermissionArray,
  projects: Array<{
    id: string,
    tag: string,
  }>,
  tags: Array<string>,
  highlighted: boolean,
};

class EventForm extends React.Component<Props, State> {
  state = {
    id: this.props.event ? this.props.event.id : undefined,
    title: this.props.event ? this.props.event.title : "",
    location: this.props.event ? this.props.event.location : "",
    start:
      this.props.event && this.props.event.start
        ? moment(this.props.event.start).toDate()
        : null,
    end:
      this.props.event && this.props.event.end
        ? moment(this.props.event.end).toDate()
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

  onChangeStart = (event, date) => {
    this.setState({ start: date });
  };
  onChangeEnd = (event, date) => {
    this.setState({ end: date });
  };

  onChangeStartDate = (event, date) => {
    if (!this.state.start) {
      this.setState({ start: date });
    } else {
      this.setState({
        start: moment(this.state.start)
          .set({
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
          })
          .toDate(),
      });
    }
  };

  onChangeEndDate = (event, date) => {
    if (!this.state.end) {
      this.setState({ end: date });
    } else {
      this.setState({
        end: moment(this.state.end)
          .set({
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
          })
          .toDate(),
      });
    }
  };

  onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ mdtext: event.target.value });
  };

  onChangePermissions = (permissions) => {
    this.setState({ permissions });
  };

  onChangeProjects = (projects) => {
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

  renderChip = (data, key) => {
    return <Chip key={key} label={data} />;
  };

  render() {
    return (
      <Dialog
        title={this.props.title}
        open={this.props.isOpen}
        onClose={this.props.cancel}
      >
        <DialogContent>
          <div>
            <TextField
              value={this.state.title}
              label="Tittel"
              onChange={this.onChangeTitle}
              required
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
              floatingLabelText="Start"
              onChange={this.onChangeStartDate}
              style={{ flex: "1 1 auto" }}
            />
            <TimePicker
              value={this.state.start}
              floatingLabelText="Klokkeslett"
              format="24hr"
              onChange={this.onChangeStart}
              style={{ flex: "1 1 auto" }}
            />
          </div>
          <div className="small-narrow" style={{ display: "flex" }}>
            <DatePicker
              value={this.state.end}
              floatingLabelText="Slutt"
              onChange={this.onChangeEndDate}
              style={{ flex: "1 1 auto" }}
            />
            <TimePicker
              value={this.state.end}
              floatingLabelText="Klokkeslett"
              format="24hr"
              onChange={this.onChangeEnd}
              style={{ flex: "1 1 auto" }}
            />
          </div>
          <div>
            <TextField
              value={this.state.mdtext}
              label="Beskrivelse"
              multiline
              fullWidth
              onChange={this.onChangeDescription}
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
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={this.props.cancel}>
            Avbryt
          </Button>
          <Button variant="text" onClick={this.save} color="primary">
            Lagre
          </Button>
        </DialogActions>
      </Dialog>
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
