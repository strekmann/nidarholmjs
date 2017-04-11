import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import React from 'react';
import Relay from 'react-relay';

class ProjectField extends React.Component {
    static propTypes = {
        organization: React.PropTypes.object,
        projects: React.PropTypes.array,
        onChange: React.PropTypes.func.isRequired,
    }

    state = {
        project: '',
        projects: this.props.projects || [],
    }

    onProjectChange = (project) => {
        this.setState({ project });
    }

    addProject = (value) => {
        const { projects } = this.state;
        projects.push(value.project);
        this.setState({
            projects,
            project: '',
        });
        this.props.onChange(projects);
    }

    removeProject = (project) => {
        const projects = this.state.projects.filter((p) => {
            return p.id !== project.id;
        });
        this.setState({ projects });
        this.props.onChange(projects);
    }

    render() {
        if (!this.props.organization) {
            return null;
        }
        const projects = this.props.organization.projectTags.map((project) => {
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
                    dataSourceConfig={{ text: 'title', value: 'project' }}
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

export default Relay.createContainer(ProjectField, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                projectTags {
                    id
                    tag
                    title
                    year
                }
            }`;
        },
    },
});
