/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import axios from 'axios';

import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Date from './Date';
import Text from './Text';
import EventList from './EventList';
import EditEvent from './EditEvent';
import ProjectForm from './ProjectForm';
import FileList from './FileList';
import FileUpload from './FileUpload';
import MusicList from './MusicList';
import AddEventMutation from '../mutations/addEvent';
import AddFileMutation from '../mutations/addFile';
import SaveFilePermissionsMutation from '../mutations/saveFilePermissions';
import SaveProjectMutation from '../mutations/saveProject';
import SetProjectPosterMutation from '../mutations/setProjectPoster';
import theme from '../theme';

class Project extends React.Component {
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
        public: false,
        addEvent: false,
        addFile: false,
        editProject: false,
        event: {
            title: '',
            location: '',
            start: null,
            end: null,
            tags: [],
            year: '',
            permissions: [],
            mdtext: '',
        },
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onDrop = (files, permissions) => {
        files.forEach(file => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new AddFileMutation({
                    viewer: null,
                    organization: this.props.organization,
                    hex: response.data.hex,
                    permissions,
                    tags: [this.props.organization.project.tag],
                    filename: file.name,
                    projectTag: this.props.organization.project.tag,
                }), {
                    onSuccess: () => {
                        // console.log("successfile");
                    },
                    onFailure: transaction => {
                        console.error(transaction.getError().source.errors);
                    },
                });
            })
            .catch(error => {
                console.error("err", error);
            });
        });
    }

    togglePublic = () => {
        this.setState({ public: !this.state.public });
    }

    toggleAddEvent = () => {
        this.setState({ addEvent: !this.state.addEvent });
    }

    toggleEditProject = () => {
        this.setState({ editProject: !this.state.editProject });
    }

    closeAddEvent = () => {
        this.setState({ addEvent: false });
    }

    toggleAddFile = () => {
        this.setState({ addFile: !this.state.addFile });
    }

    closeAddFile = () => {
        this.setState({ addFile: false });
    }

    saveEvent = (event) => {
        this.context.relay.commitUpdate(new AddEventMutation({
            organization: this.props.organization,
            title: event.title,
            location: event.location,
            start: event.start,
            end: event.end,
            tags: [this.props.organization.project.tag],
            mdtext: event.mdtext,
            permissions: event.permissions.map(permission => permission.value),
        }), {
            onSuccess: () => {
                this.closeAddEvent();
            },
            onFailure: (error, ost, kake) => {
                console.error('AD', error, ost, kake);
            },
        });
    }

    onSaveFilePermissions = (file, permissions, onSuccess) => {
        this.context.relay.commitUpdate(new SaveFilePermissionsMutation({
            organization: this.props.organization,
            fileId: file,
            permissions: permissions.map(permission => permission.id),
        }), {
            onSuccess,
        });
    }

    onSetProjectPoster = (file) => {
        this.context.relay.commitUpdate(new SetProjectPosterMutation({
            organization: this.props.organization,
            fileId: file,
            projectId: this.props.organization.project.id,
        }));
    }

    saveProject = (project, callbacks) => {
        this.context.relay.commitUpdate(new SaveProjectMutation({
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
        const viewer = this.props.viewer;
        const org = this.props.organization;
        const project = this.props.organization.project;
        const isMember = this.props.organization.isMember;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1>{project.title}</h1>
                        <div className="meta">
                            {project.start ? <span><Date date={project.start} /> – </span> : null}
                            <Date date={project.end} />
                            {project.conductors.map(conductor => conductor.name)}
                        </div>
                    </div>
                    {isMember
                        ? <IconMenu
                            iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Rediger prosjektinfo"
                                onTouchTap={this.toggleEditProject}
                            />
                            <MenuItem
                                primaryText="Legg til aktivitet"
                                onTouchTap={this.toggleAddEvent}
                            />
                            <MenuItem
                                primaryText="Last opp filer"
                                onTouchTap={this.toggleAddFile}
                            />
                        </IconMenu>
                        : null
                    }
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        margin: '0 -15px',
                    }}
                >
                    <div style={{ padding: '0 15px', maxWidth: 640 }}>
                        {project.music.length
                                ? <div>
                                    <h2>Repertoar</h2>
                                    <MusicList music={project.music} isMember={isMember} />
                                </div>
                                : null
                        }
                        {project.publicMdtext
                            ? <div>
                                <h2>Informasjon</h2>
                                <Text text={project.publicMdtext} />
                            </div>
                            : null
                        }
                        {isMember && project.privateMdtext
                            ? <div>
                                <h2>Intern informasjon</h2>
                                <Text text={project.privateMdtext} />
                            </div>
                            : null
                        }
                        {isMember && project.files.edges.length
                            ? <FileList
                                files={project.files}
                                memberGroupId={org.memberGroup.id}
                                onSavePermissions={this.onSaveFilePermissions}
                                onSetProjectPoster={this.onSetProjectPoster}
                                style={{ margin: '0 -15px' }}
                                title="Prosjektfiler"
                                viewer={this.props.viewer}
                            />
                            : null
                        }
                    </div>
                    <div style={{ width: 300, padding: '0 15px' }}>
                        {project.poster ?
                            <img alt="Konsertplakat" src={project.poster.largePath} />
                            :
                            null
                        }
                        {project.events.length
                            ? <EventList events={project.events} />
                            : null
                        }
                    </div>
                </div>
                {isMember
                    ? <div>
                        <ProjectForm
                            open={this.state.editProject}
                            save={this.saveProject}
                            toggle={this.toggleEditProject}
                            viewer={this.props.viewer}
                            {...project}
                        />
                        <Dialog
                            title="Legg til aktivitet"
                            open={this.state.addEvent}
                            onRequestClose={this.closeAddEvent}
                            autoScrollBodyContent
                        >
                            <EditEvent
                                viewer={this.props.viewer}
                                saveEvent={this.saveEvent}
                                {...this.state.event}
                            />
                        </Dialog>
                        <Dialog
                            title="Last opp filer"
                            open={this.state.addFile}
                            onRequestClose={this.closeAddFile}
                            autoScrollBodyContent
                        >
                            <FileUpload viewer={viewer} organization={org} onDrop={this.onDrop} />
                            <RaisedButton label="Ferdig" primary onTouchTap={this.closeAddFile} />
                        </Dialog>
                    </div>
                    : null
                }
            </Paper>
        );
    }
}

export default Relay.createContainer(Project, {
    initialVariables: {
        year: '',
        tag: '',
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            groups {
                id
                name
            }
            ${ProjectForm.getFragment('viewer')}
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            name
            isMember
            memberGroup {
                id
            }
            project(year:$year, tag:$tag) {
                id
                title
                tag
                start
                end
                year
                publicMdtext
                privateMdtext
                conductors {
                    name
                }
                poster {
                    filename
                    largePath
                }
                events(first:100) {
                    edges {
                        node {
                            id
                            title
                            start
                            end
                            permissions {
                                public
                                groups {
                                    id
                                    name
                                }
                                users {
                                    id
                                    name
                                }
                            }
                            mdtext
                        }
                    }
                }
                files(first:100) {
                    edges {
                        node {
                            id
                            filename
                            created
                            mimetype
                            size
                            permissions {
                                public
                                groups {
                                    id
                                    name
                                }
                                users {
                                    id
                                    name
                                }
                            }
                            tags
                            isImage
                            normalPath
                            path
                        }
                    }
                }
                music {
                    piece {
                        id
                        title
                        composers
                    }
                }
            }
            ${AddEventMutation.getFragment('organization')}
            ${AddFileMutation.getFragment('organization')}
            ${SaveFilePermissionsMutation.getFragment('organization')}
            ${SaveProjectMutation.getFragment('organization')}
            ${SetProjectPosterMutation.getFragment('organization')}
        }`,
    },
});
