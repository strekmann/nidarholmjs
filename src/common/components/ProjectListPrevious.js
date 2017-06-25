import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';

import ProjectItem from './ProjectItem';

const PROJECTS_PER_PAGE = 10;

class ProjectListPrevious extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        title: PropTypes.string,
        organization: PropTypes.object,
        relay: PropTypes.object,
    }

    loadMore = () => {
        const projects = this.props.organization.previousProjects;
        this.props.relay.setVariables({
            showProjects: projects.edges.length + PROJECTS_PER_PAGE,
        });
    }

    render() {
        const projects = this.props.organization.previousProjects;
        return (
            <div>
                <h1>{this.props.title}</h1>
                {projects.edges.map((edge) => {
                    return (
                        <ProjectItem
                            key={edge.node.id}
                            project={edge.node}
                        />
                    );
                })}
                {projects.pageInfo.hasNextPage
                    ? <RaisedButton primary onClick={this.loadMore} label="Mer" />
                    : null
                }
            </div>
        );
    }
}

export default Relay.createContainer(ProjectListPrevious, {
    initialVariables: {
        showProjects: PROJECTS_PER_PAGE,
        projectsPerPage: PROJECTS_PER_PAGE,
    },
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isMember
                previousProjects(first:$showProjects) {
                    edges {
                        node {
                            id
                            ${ProjectItem.getFragment('project')}
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
            }`;
        },
    },
});
