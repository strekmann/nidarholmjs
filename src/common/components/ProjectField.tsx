import AutoComplete from "material-ui/AutoComplete";
import Chip from "material-ui/Chip";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { ProjectField_organization } from "./__generated__/ProjectField_organization.graphql";
import { Project } from "./Project";

type Props = {
  organization: ProjectField_organization;
  projects: Project[];
  onChange: any;
};

type State = {
  project: string;
  projects: Project[];
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
        title: `${_project.title} (${_project.year})`,
        _project,
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
          searchText={project}
          onNewRequest={this.addProject}
          onUpdateInput={this.onProjectChange}
        />
        {stateProjects.map((_project) => {
          return (
            <Chip
              key={_project.id}
              onRequestDelete={() => {
                this.removeProject(_project);
              }}
            >
              {_project.title}
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
