import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
import AddProjectMutation from '../mutations/addProject';

import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

const showUpcomingProjects = 4;
const projectsPerPage = 10;

class Projects extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
        relay: React.PropTypes.object,
        viewer: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        addProject: false,
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

    toggleAddProject = () => {
        this.setState({ addProject: !this.state.addProject });
    }

    saveProject = (project, callbacks) => {
        this.context.relay.commitUpdate(new AddProjectMutation({
            organization: this.props.organization,
            ...project,
        }), {
            onSuccess: () => {
                if (callbacks && callbacks.onSuccess) {
                    callbacks.onSuccess();
                }
            },
        });
    }

    render() {
        const org = this.props.organization;
        const isMember = this.props.organization.isMember;
        const { desktopGutterLess } = theme.spacing;
        return (
            <section>
                {isMember
                        ? <ProjectForm
                            open={this.state.addProject}
                            save={this.saveProject}
                            toggle={this.toggleAddProject}
                            viewer={this.props.viewer}
                            organization={null}
                        />
                        : null
                }
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {isMember
                        ? <IconMenu
                            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Nytt prosjekt"
                                onTouchTap={this.toggleAddProject}
                            />
                        </IconMenu>
                        : null
                    }
                </div>
                <div
                    className="row small-narrow"
                    style={{
                        display: 'flex',
                        marginLeft: -desktopGutterLess,
                        marginRight: -desktopGutterLess,
                    }}
                >
                    <div
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                            flex: '1 1 auto',
                        }}
                    >
                        <h1>Kommende prosjekter</h1>
                        <ProjectList
                            projects={org.nextProjects}
                        />
                        {org.nextProjects.pageInfo.hasNextPage
                                ? <RaisedButton primary onClick={this.loadMoreUpcomongProjects} label="Mer" />
                                : null
                        }
                    </div>
                    <div
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                            flex: '1 1 auto',
                        }}
                    >
                        <h1>Tidligere prosjekter</h1>
                        <ProjectList
                            projects={org.previousProjects}
                        />
                        {org.previousProjects.pageInfo.hasNextPage
                                ? <RaisedButton primary onClick={this.loadMorePreviousProjects} label="Mer" />
                                : null
                        }
                    </div>
                </div>
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
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isMember
                nextProjects(first:$showUpcomingProjects) {
                    edges {
                        node {
                            id
                            title
                            start
                            end
                            year
                            tag
                            publicMdtext
                            poster {
                                filename
                                normalPath
                            }
                            conductors {
                                name
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
                                normalPath
                            }
                            conductors {
                                name
                            }
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
                ${AddProjectMutation.getFragment('organization')}
            }`;
        },
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
                ${ProjectForm.getFragment('viewer')}
            }`;
        },
    },
});
