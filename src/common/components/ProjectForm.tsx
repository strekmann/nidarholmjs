import MomentUtils from "@date-io/moment";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import moment from "moment";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { PermissionArray, PermissionObject } from "../types";
import { flattenPermissions, urlify } from "../utils";
import PermissionField from "./PermissionField";
import UserField from "./UserField";
import { ProjectForm_organization } from "./__generated__/ProjectForm_organization.graphql";
import { ProjectForm_viewer } from "./__generated__/ProjectForm_viewer.graphql";

type Props = {
  open: boolean,
  save: any /*(
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
      onSuccess: any; //() => void,
    },
  ) => void,*/,
  onClose: () => void,
  viewer: ProjectForm_viewer,
  organization: ProjectForm_organization,
  id?: string,
  title?: string,
  tag?: string,
  privateMdtext?: string,
  publicMdtext?: string,
  start?: moment.Moment | null,
  end?: moment.Moment | null,
  permissions?: PermissionObject,
  conductors?: any[],
  managers?: any[],
};

type State = {
  title: string,
  tag: string,
  privateMdtext: string,
  publicMdtext: string,
  start?: moment.Moment | null,
  end?: moment.Moment | null,
  permissions: PermissionArray,
  conductors: any[],
  managers: any[],
};

class ProjectForm extends React.Component<Props, State> {
  static defaultProps = {
    open: false,
    id: undefined,
    title: "",
    tag: "",
    privateMdtext: "",
    publicMdtext: "",
    start: undefined,
    end: undefined,
    permissions: { public: false, groups: [], friends: [] },
    conductors: [],
    managers: [],
  };

  state = {
    title: this.props.title,
    tag: this.props.tag,
    privateMdtext: this.props.privateMdtext,
    publicMdtext: this.props.publicMdtext,
    start: this.props.start ? moment(this.props.start) : undefined,
    end: this.props.end ? moment(this.props.end) : undefined,
    permissions: this.props.permissions
      ? flattenPermissions(this.props.permissions)
      : [],
    conductors: this.props.conductors || [],
    managers: this.props.managers || [],
  };

  onChangeTitle = (event) => {
    let { tag } = this.state;
    if (!this.props.id) {
      tag = urlify(event.target.value);
      if (this.state.end) {
        tag = `${tag}-${moment(this.state.end).year()}`;
      }
    }
    this.setState({
      title: event.target.value,
      tag,
    });
  };

  onChangeTag = (event) => {
    this.setState({ tag: event.target.value });
  };

  onChangePrivateMdtext = (event) => {
    this.setState({ privateMdtext: event.target.value });
  };

  onChangePublicMdtext = (event) => {
    this.setState({ publicMdtext: event.target.value });
  };

  onChangeStart = (start: moment.Moment | null) => {
    this.setState({ start: start ? start.startOf("date") : null });
  };

  onChangeEnd = (end: moment.Moment | null) => {
    this.setState({ end: end ? end.startOf("date") : null });
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

  onClose = () => {
    this.props.onClose();
  };

  saveProject = (event) => {
    event.preventDefault();
    this.props.onClose();
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
              start: undefined,
              end: undefined,
              permissions: [],
              conductors: [],
              managers: [],
            });
          }
        },
        onFailure: (transaction: any) => {
          // eslint-disable-next-line no-console
          console.error(transaction);
        },
      },
    );
  };

  render() {
    const { organization, viewer } = this.props;
    const permissions = [];
    if (viewer) {
      permissions.push({ value: "p", text: "Verden" });
      viewer.groups.forEach((group) => {
        permissions.push({ value: group.id, text: group.name });
      });
    }

    return (
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Dialog open={this.props.open} onClose={this.onClose}>
          <form onSubmit={this.saveProject}>
            <DialogTitle id="project-dialog-title">
              {this.props.id ? "Rediger prosjekt" : "Nytt prosjekt"}
            </DialogTitle>
            <DialogContent>
              <div>
                <TextField
                  label="Tittel"
                  onChange={this.onChangeTitle}
                  value={this.state.title}
                  error={!this.state.title}
                  required
                />
              </div>
              <div>
                <TextField
                  label="Identifikator"
                  onChange={this.onChangeTag}
                  value={this.state.tag}
                  error={!this.state.tag}
                  helperText="Dette feltet bør være unikt per prosjekt"
                  required
                />
              </div>
              <div>
                <TextField
                  label="Intern beskrivelse"
                  onChange={this.onChangePrivateMdtext}
                  value={this.state.privateMdtext}
                  multiline
                  fullWidth
                />
              </div>
              {this.props.id ? (
                <div>
                  <TextField
                    label="Ekstern beskrivelse"
                    onChange={this.onChangePublicMdtext}
                    value={this.state.publicMdtext}
                    multiline
                    fullWidth
                  />
                </div>
              ) : null}
              <div>
                <DatePicker
                  label="Prosjektstart"
                  onChange={this.onChangeStart}
                  value={this.state.start}
                  clearable
                  autoOk
                />
              </div>
              <div>
                <DatePicker
                  id="end"
                  label="Prosjektslutt"
                  onChange={this.onChangeEnd}
                  value={this.state.end}
                  required
                  autoOk
                />
              </div>
              <div>
                <UserField
                  users={this.state.conductors}
                  organization={organization}
                  onChange={this.onChangeConductors}
                  title="Dirigent(er)"
                />
              </div>
              <div>
                <UserField
                  users={this.state.managers}
                  organization={organization}
                  onChange={this.onChangeManagers}
                  title="Prosjektleder(e)"
                />
              </div>
              <div>
                <PermissionField
                  permissions={this.state.permissions}
                  onChange={this.onPermissionChange}
                  groups={this.props.viewer.groups}
                  users={[]}
                  fullWidth
                />
              </div>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" type="reset" onClick={this.onClose}>
                Avbryt
              </Button>
              <Button
                variant="contained"
                onSubmit={this.saveProject}
                type="submit"
                color="primary"
              >
                Lagre
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </MuiPickersUtilsProvider>
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
