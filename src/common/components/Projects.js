import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
import ProjectList from './ProjectList';

const showUpcomingProjects = 4;
const projectsPerPage = 10;

class Projects extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
        relay: {
            setVariables: React.PropTypes.func,
        },
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    loadMorePreviousProjects = () => {
        const projects = this.props.organization.previousProjects;
        this.props.relay.setVariables({
            showProjects: projects.edges.length + projectsPerPage,
        });
    }

    loadMoreUpcomongProjects = () => {
        const projects = this.props.organization.nextProjects;
        let next = projects.edges.length + projectsPerPage;

        // upcoming list has just a couple of projects, so at first refill,
        // use default page size
        if (projects.edges.length < projectsPerPage) {
            next = projectsPerPage;
        }
        this.props.relay.setVariables({
            showUpcomingProjects: next,
        });
    }

    render() {
        const org = this.props.organization;
        return (
            <section>
                <h1>Kommende prosjekter</h1>
                <ProjectList
                    projects={org.nextProjects}
                />
                {org.nextProjects.pageInfo.hasNextPage ?
                    <RaisedButton primary onClick={this.loadMoreUpcomongProjects}>Mer</RaisedButton>
                    :
                    null
                }
                <h1>Tidligere prosjekter</h1>
                <ProjectList
                    projects={org.previousProjects}
                />
                {org.previousProjects.pageInfo.hasNextPage ?
                    <RaisedButton primary onClick={this.loadMorePreviousProjects}>Mer</RaisedButton>
                    :
                    null
                }
            </section>
        );
    }
}

export default Relay.createContainer(Projects, {
    initialVariables: {
        showUpcomingProjects,
        showProjects: projectsPerPage,
        projectsPerPage,
    },
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            nextProjects(first:$showUpcomingProjects) {
                edges {
                    node {
                        id
                        title
                        start
                        end
                        year
                        tag
                        public_mdtext
                        poster {
                            filename
                            thumbnail_path
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
            previousProjects(first:$showProjects) {
                edges {
                    node {
                        id
                        title
                        start
                        end
                        year
                        tag
                        poster {
                            filename
                            thumbnail_path
                        }
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    },
});
