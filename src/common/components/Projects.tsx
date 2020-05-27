import { Theme, withTheme } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import AddProjectMutation from "../mutations/AddProject";
import ProjectForm from "./ProjectForm";
import ProjectListPrevious from "./ProjectListPrevious";
import ProjectListUpcoming from "./ProjectListUpcoming";
import { Projects_organization } from "./__generated__/Projects_organization.graphql";
import { Projects_viewer } from "./__generated__/Projects_viewer.graphql";

type Props = {
  organization: Projects_organization,
  viewer: Projects_viewer,
  relay: RelayProp,
  theme: Theme,
};

type State = {
  addProject: boolean,
  menuIsOpen: null | HTMLElement,
};

class Projects extends React.Component<Props, State> {
  state = {
    addProject: false,
    menuIsOpen: null,
  };

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  toggleAddProject = () => {
    this.setState({ addProject: !this.state.addProject, menuIsOpen: null });
  };

  addProject = (project, callbacks: { onSuccess: () => void }) => {
    const { relay } = this.props;
    AddProjectMutation.commit(relay.environment, project, () => {
      if (callbacks && callbacks.onSuccess) {
        callbacks.onSuccess();
      }
    });
  };

  render() {
    const { organization, theme } = this.props;
    const { isMember } = organization;
    return (
      <section>
        {isMember ? (
          <ProjectForm
            open={this.state.addProject}
            save={this.addProject}
            onClose={this.toggleAddProject}
            viewer={this.props.viewer}
            organization={this.props.organization}
          />
        ) : null}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          {isMember ? (
            <div>
              <IconButton onClick={this.onMenuOpen} className="context-menu">
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={this.state.menuIsOpen}
                onClose={this.onMenuClose}
                open={Boolean(this.state.menuIsOpen)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={this.toggleAddProject}
                  className="project-new"
                >
                  Nytt prosjekt
                </MenuItem>
              </Menu>
            </div>
          ) : null}
        </div>
        <div
          className="row small-narrow"
          style={{
            display: "flex",
            marginLeft: -theme.spacing(2),
            marginRight: -theme.spacing(2),
          }}
        >
          <div
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
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
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
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

export default withTheme(
  createFragmentContainer(Projects, {
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
  }),
);
