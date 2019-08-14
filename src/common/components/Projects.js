// @flow

import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import PropTypes from "prop-types";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import type { RelayProp } from "react-relay";

import theme from "../theme";
import AddProjectMutation from "../mutations/AddProject";

import ProjectListPrevious from "./ProjectListPrevious";
import ProjectListUpcoming from "./ProjectListUpcoming";
import ProjectForm from "./ProjectForm";
import ProjectsOrganization from "./__generated__/Projects_organization.graphql";
import ProjectsViewer from "./__generated__/Projects_viewer.graphql";

type Props = {
  organization: ProjectsOrganization,
  viewer: ProjectsViewer,
  relay: RelayProp,
};

type State = {
  addProject: boolean,
};

class Projects extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    addProject: false,
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

  toggleAddProject = () => {
    this.setState({ addProject: !this.state.addProject });
  };

  addProject = (project, callbacks) => {
    const { relay } = this.props;
    AddProjectMutation.commit(relay.environment, project, () => {
      if (callbacks && callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    });
  };

  render() {
    const { isMember } = this.props.organization;
    const { desktopGutterLess } = theme.spacing;
    return (
      <section>
        {isMember ? (
          <ProjectForm
            open={this.state.addProject}
            save={this.addProject}
            toggle={this.toggleAddProject}
            viewer={this.props.viewer}
            organization={this.props.organization}
          />
        ) : null}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {isMember ? (
            <IconMenu
              iconButtonElement={
                <IconButton>
                  <MoreVertIcon />
                </IconButton>
              }
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              targetOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                primaryText="Nytt prosjekt"
                onClick={this.toggleAddProject}
              />
            </IconMenu>
          ) : null}
        </div>
        <div
          className="row small-narrow"
          style={{
            display: "flex",
            marginLeft: -desktopGutterLess,
            marginRight: -desktopGutterLess,
          }}
        >
          <div
            style={{
              paddingLeft: desktopGutterLess,
              paddingRight: desktopGutterLess,
              flex: "1 1 50%",
            }}
          >
            <ProjectListUpcoming
              title="Kommende prosjekter"
              organization={this.props.organization}
            />
          </div>
          <div
            style={{
              paddingLeft: desktopGutterLess,
              paddingRight: desktopGutterLess,
              flex: "1 1 50%",
            }}
          >
            <ProjectListPrevious
              organization={this.props.organization}
              title="Tidligere prosjekter"
            />
          </div>
        </div>
      </section>
    );
  }
}

export default createFragmentContainer(Projects, {
  organization: graphql`
    fragment Projects_organization on Organization {
      isMember
      ...ProjectListPrevious_organization
      ...ProjectListUpcoming_organization
      ...ProjectForm_organization
    }
  `,
  viewer: graphql`
    fragment Projects_viewer on User {
      id
      ...ProjectForm_viewer
    }
  `,
});
