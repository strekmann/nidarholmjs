import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';

import ProjectItem from './ProjectItem';

const PROJECTS_PER_PAGE = 10;

class ProjectListUpcoming extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        title: PropTypes.string,
        organization: PropTypes.object,
        relay: PropTypes.object,
    }

    loadMore = () => {
        const projects = this.props.organization.nextProjects;
        let next = projects.edges.length + PROJECTS_PER_PAGE;

        // upcoming list has just a couple of projects, so at first refill,
        // use default page size
        if (projects.edges.length < PROJECTS_PER_PAGE) {
            next = PROJECTS_PER_PAGE;
        }
        this.props.relay.setVariables({
            showProjects: next,
        });
    }

    render() {
        const projects = this.props.organization.nextProjects;
        return (
            <div>
                <h1>{this.props.title}</h1>
                {projects.edges.map((edge) => {
                    return (
                        <ProjectItem
                            key={edge.node.id}
                            project={edge.node}
                            showText
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

export default Relay.createContainer(ProjectListUpcoming, {
    initialVariables: {
        showProjects: 4,
        projectsPerPage: PROJECTS_PER_PAGE,
    },
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isMember
                nextProjects(first:$showProjects) {
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
