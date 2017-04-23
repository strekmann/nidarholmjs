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

import ProjectListPrevious from './ProjectListPrevious';
import ProjectListUpcoming from './ProjectListUpcoming';
import ProjectForm from './ProjectForm';

class Projects extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
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
                            flex: '1 1 50%',
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
                            flex: '1 1 50%',
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

export default Relay.createContainer(Projects, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isMember
                ${AddProjectMutation.getFragment('organization')}
                ${ProjectListPrevious.getFragment('organization')}
                ${ProjectListUpcoming.getFragment('organization')}
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
