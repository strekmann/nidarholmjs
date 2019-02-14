// @flow

import AutoComplete from "material-ui/AutoComplete";
import Chip from "material-ui/Chip";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import ProjectFieldOrganization from "./__generated__/ProjectField_organization.graphql";
import Project from "./Project";

type Props = {
  organization: ProjectFieldOrganization,
  projects: Project[],
  onChange: any,
};

type State = {
  project: string,
  projects: Project[],
};

class ProjectField extends React.Component<Props, State> {
  state = {
    project: "",
    projects: this.props.projects || [],
  };

  onProjectChange = (project) => {
    this.setState({ project });
  };

  addProject = (value) => {
    const projects = this.state.projects.slice(); // copy
    const { project } = value; // copy
    projects.push(project);
    this.setState({
      projects,
      project: "",
    });
    this.props.onChange(projects);
  };

  removeProject = (project) => {
    const projects = this.state.projects.filter((p) => {
      return p.id !== project.id;
    });
    this.setState({ projects });
    this.props.onChange(projects);
  };

  render() {
    const { organization } = this.props;
    if (!organization) {
      return null;
    }
    const projects = organization.projectTags.map((project) => {
      return {
        title: `${project.title} (${project.year})`,
        project,
      };
    });
    return (
      <div>
        <AutoComplete
          id="projects"
          floatingLabelText="Tilhører prosjekt"
          filter={AutoComplete.fuzzyFilter}
          dataSource={projects}
          dataSourceConfig={{ text: "title", value: "project" }}
          maxSearchResults={20}
          searchText={this.state.project}
          onNewRequest={this.addProject}
          onUpdateInput={this.onProjectChange}
        />
        {this.state.projects.map((project) => {
          return (
            <Chip
              key={project.id}
              onRequestDelete={() => {
                this.removeProject(project);
              }}
            >
              {project.title}
            </Chip>
          );
        })}
      </div>
    );
  }
}

export default createFragmentContainer(ProjectField, {
  organization: graphql`
    fragment ProjectField_organization on Organization {
      id
      projectTags {
        id
        tag
        title
        year
      }
    }
  `,
});
