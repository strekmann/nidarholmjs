import Chip from "@material-ui/core/Chip";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import Autocomplete from "./Autocomplete";
import { Project } from "./Project";
import { ProjectField_organization } from "./__generated__/ProjectField_organization.graphql";

type Props = {
  organization: ProjectField_organization,
  projects: Project[],
  onChange: any,
};

type State = {
  project: string,
  projects: Project[],
};

class ProjectField extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { projects } = this.props;
    this.state = {
      project: "",
      projects: projects || [],
    };
  }

  onProjectChange = (project) => {
    this.setState({ project });
  };

  addProject = (value) => {
    const { onChange } = this.props;
    const { projects: stateProjects } = this.state;
    const projects = stateProjects.slice(); // copy
    const { project } = value; // copy
    projects.push(project);
    this.setState({
      projects,
      project: "",
    });
    onChange(projects);
  };

  removeProject = (project) => {
    const { onChange } = this.props;
    const { projects: stateProjects } = this.state;
    const projects = stateProjects.filter((p) => {
      return p.id !== project.id;
    });
    this.setState({ projects });
    onChange(projects);
  };

  render() {
    const { organization } = this.props;
    const { projects: stateProjects, project } = this.state;
    if (!organization) {
      return null;
    }
    const projects = organization.projectTags.map((_project) => {
      return {
        label: `${_project.title} (${_project.year})`,
        id: _project.id,
      };
    });
    return (
      <div>
        <Autocomplete
          label="Tilhører prosjekt"
          options={projects}
          onChange={this.addProject}
          onUpdateInput={this.onProjectChange}
        />
        {stateProjects.map((_project) => {
          return (
            <Chip
              key={_project.id}
              onDelete={() => {
                this.removeProject(_project);
              }}
              label={_project.title}
            />
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
