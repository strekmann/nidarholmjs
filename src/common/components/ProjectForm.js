/* @flow */

import areIntlLocalesSupported from "intl-locales-supported";
import DatePicker from "material-ui/DatePicker";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import moment from "moment";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { flattenPermissions } from "../utils";
import type { PermissionObject, PermissionArray } from "../types";

import UserField from "./UserField";
import PermissionField from "./PermissionField";
import type ProjectFormViewer from "./__generated__/ProjectForm_organization.graphql";

let DateTimeFormat;
if (areIntlLocalesSupported(["nb"])) {
  ({ DateTimeFormat } = global.Intl);
}

type Props = {
  open: () => void,
  save: (
    {
      id: string,
      title: string,
      tag: string,
      privateMdtext: string,
      publicMdtext: string,
      start: moment,
      end: moment,
      permissions: Array<string>,
      conductors: Array<string>,
      managers: Array<string>,
    },
    {
      onSuccess: () => void,
    },
  ) => void,
  toggle: () => void,
  viewer: ProjectFormViewer,
  organization: {},
  id: string,
  title: string,
  tag: string,
  privateMdtext: string,
  publicMdtext: string,
  start: string,
  end: string,
  permissions: PermissionObject,
  conductors: [],
  managers: [],
};

type State = {
  title: string,
  tag: string,
  privateMdtext: string,
  publicMdtext: string,
  start: moment,
  end: moment,
  permissions: PermissionArray,
  conductors: [],
  managers: [],
};

class ProjectForm extends React.Component<Props, State> {
  static defaultProps = {
    open: false,
    id: null,
    title: "",
    tag: "",
    privateMdtext: "",
    publicMdtext: "",
    start: null,
    end: null,
    permissions: { public: false, groups: [], friends: [] },
    conductors: [],
    managers: [],
  };

  state = {
    title: this.props.title,
    tag: this.props.tag,
    privateMdtext: this.props.privateMdtext,
    publicMdtext: this.props.publicMdtext,
    start: this.props.start ? moment(this.props.start).toDate() : null,
    end: this.props.end ? moment(this.props.end).toDate() : null,
    permissions: this.props.permissions
      ? flattenPermissions(this.props.permissions)
      : [],
    conductors: this.props.conductors || [],
    managers: this.props.managers || [],
  };

  onChangeTitle = (event, title) => {
    this.setState({ title });
  };

  onChangeTag = (event, tag) => {
    this.setState({ tag });
  };

  onChangePrivateMdtext = (event, privateMdtext) => {
    this.setState({ privateMdtext });
  };

  onChangePublicMdtext = (event, publicMdtext) => {
    this.setState({ publicMdtext });
  };

  onChangeStart = (event, start) => {
    this.setState({ start });
  };

  onChangeEnd = (event, end) => {
    this.setState({ end });
  };

  onPermissionChange = (permissions) => {
    this.setState({ permissions });
  };

  onChangeConductors = (conductors) => {
    this.setState({ conductors });
  };

  onChangeManagers = (managers) => {
    this.setState({ managers });
  };

  addPermission = (chosen) => {
    const { permissions } = this.state;
    permissions.push(chosen);
    this.setState({
      permissions,
    });
  };

  removePermission = (permissionId) => {
    const permissions = this.state.permissions.filter((_p) => {
      return _p.id !== permissionId;
    });
    this.setState({
      permissions,
    });
  };

  toggle = () => {
    this.props.toggle();
  };

  saveProject = (event) => {
    event.preventDefault();
    this.props.toggle();
    this.props.save(
      {
        id: this.props.id,
        title: this.state.title,
        tag: this.state.tag,
        privateMdtext: this.state.privateMdtext,
        publicMdtext: this.state.publicMdtext,
        start: this.state.start,
        end: this.state.end,
        permissions: this.state.permissions.map((p) => {
          return p.id;
        }),
        conductors: this.state.conductors.map((c) => {
          return c.id;
        }),
        managers: this.state.managers.map((m) => {
          return m.id;
        }),
      },
      {
        onSuccess: () => {
          if (!this.props.id) {
            this.setState({
              title: "",
              tag: "",
              privateMdtext: "",
              publicMdtext: "",
              start: null,
              end: null,
              permissions: [],
              conductors: [],
              managers: [],
            });
          }
        },
      },
    );
  };

  render() {
    const { viewer } = this.props;
    const permissions = [];
    if (viewer) {
      permissions.push({ value: "p", text: "Verden" });
      viewer.groups.forEach((group) => {
        permissions.push({ value: group.id, text: group.name });
      });
    }

    return (
      <Dialog
        title={this.props.id ? "Rediger prosjekt" : "Nytt prosjekt"}
        open={this.props.open}
        onRequestClose={this.toggle}
        autoScrollBodyContent
        actions={[
          <FlatButton onTouchTap={this.toggle} label="Avbryt" />,
          <FlatButton onTouchTap={this.saveProject} label="Lagre" primary />,
        ]}
      >
        <div>
          <TextField
            floatingLabelText="Tittel"
            onChange={this.onChangeTitle}
            value={this.state.title}
            required
          />
        </div>
        <div>
          <TextField
            floatingLabelText="Identifikator"
            onChange={this.onChangeTag}
            value={this.state.tag}
            required
          />
        </div>
        <div>
          <TextField
            floatingLabelText="Intern beskrivelse"
            onChange={this.onChangePrivateMdtext}
            value={this.state.privateMdtext}
            multiLine
            fullWidth
          />
        </div>
        {this.props.id ? (
          <div>
            <TextField
              floatingLabelText="Ekstern beskrivelse"
              onChange={this.onChangePublicMdtext}
              value={this.state.publicMdtext}
              multiLine
              fullWidth
            />
          </div>
        ) : null}
        <div>
          <DatePicker
            id="start"
            floatingLabelText="Prosjektstart"
            onChange={this.onChangeStart}
            value={this.state.start}
            mode="landscape"
            locale="nb"
            DateTimeFormat={DateTimeFormat}
          />
        </div>
        <div>
          <DatePicker
            id="end"
            floatingLabelText="Prosjektslutt"
            onChange={this.onChangeEnd}
            value={this.state.end}
            mode="landscape"
            locale="nb"
            DateTimeFormat={DateTimeFormat}
            required
          />
        </div>
        <div>
          <UserField
            users={this.state.conductors}
            organization={this.props.organization}
            onChange={this.onChangeConductors}
            title="Dirigent(er)"
          />
        </div>
        <div>
          <UserField
            users={this.state.managers}
            organization={this.props.organization}
            onChange={this.onChangeManagers}
            title="Prosjektleder(e)"
          />
        </div>
        <div>
          <PermissionField
            permissions={this.state.permissions}
            onChange={this.onPermissionChange}
            groups={this.props.viewer.groups}
            users={this.props.viewer.friends}
          />
        </div>
      </Dialog>
    );
  }
}

export default createFragmentContainer(ProjectForm, {
  viewer: graphql`
    fragment ProjectForm_viewer on User {
      id
      groups {
        id
        name
      }
    }
  `,
  organization: graphql`
    fragment ProjectForm_organization on Organization {
      id
      ...UserField_organization
    }
  `,
});
