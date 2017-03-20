/* global FormData */

import React from 'react';
import Helmet from 'react-helmet';
import Relay from 'react-relay';
import axios from 'axios';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AddEventMutation from '../mutations/addEvent';
import AddFileMutation from '../mutations/addFile';
import AddPieceMutation from '../mutations/addPiece';
import SaveFilePermissionsMutation from '../mutations/saveFilePermissions';
import SaveProjectMutation from '../mutations/saveProject';
import SetProjectPosterMutation from '../mutations/setProjectPoster';
import { flattenPermissions } from '../utils';
import theme from '../theme';
import Date from './Date';
import Text from './Text';
import EventItem from './EventItem';
import EditEvent from './EditEvent';
import ProjectForm from './ProjectForm';
import FileList from './FileList';
import FileUpload from './FileUpload';
import MusicList from './MusicList';
import PermissionChips from './PermissionChips';

class Project extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static defaultProps = {
        viewer: {
            groups: [],
            friends: [],
        },
    }

    static propTypes = {
        organization: React.PropTypes.object.isRequired,
        viewer: React.PropTypes.object,
        relay: React.PropTypes.object.isRequired,
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
        addPiece: false,
        editProject: false,
        searchTerm: '',
        showEnded: false,
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
        files.forEach((file) => {
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
                }));
            });
        });
    }

    onSetProjectPoster = (file) => {
        this.context.relay.commitUpdate(new SetProjectPosterMutation({
            organization: this.props.organization,
            fileId: file,
            projectId: this.props.organization.project.id,
        }));
    }

    onSaveFilePermissions = (file, permissions, onSuccess) => {
        this.context.relay.commitUpdate(new SaveFilePermissionsMutation({
            organization: this.props.organization,
            fileId: file,
            permissions: permissions.map((permission) => {
                return permission.id;
            }),
        }), {
            onSuccess,
        });
    }

    toggleAddPiece = () => {
        this.setState({ addPiece: !this.state.addPiece });
    }

    closeAddPiece = () => {
        this.setState({ addPiece: false });
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

    addPiece = (piece) => {
        const { project } = this.props.organization;
        this.closeAddPiece();
        this.context.relay.commitUpdate(new AddPieceMutation({
            piece,
            project,
        }));
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
            permissions: event.permissions.map((permission) => {
                return permission.value;
            }),
        }), {
            onSuccess: () => {
                this.closeAddEvent();
            },
        });
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

    showEnded = () => {
        this.setState({ showEnded: true });
    }

    searchPiece = (searchTerm) => {
        this.setState({ searchTerm });
        this.props.relay.setVariables({ searchTerm });
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        const project = this.props.organization.project;
        const isMember = this.props.organization.isMember;
        const hasEndedActivities = project.events.edges.filter((edge) => {
            return edge.node.isEnded;
        }).length;
        return (
            <Paper className="row">
                <Helmet
                    title={project.title}
                    meta={[
                        { property: 'og:title', content: project.title },
                        { property: 'og:description', content: project.publicMdtext },
                        { property: 'og:image', content: project.poster ? `${org.baseurl}/${project.poster.largePath}` : '' },
                        { property: 'og:url', content: `${org.baseurl}/${project.year}/${project.tag}` },
                    ]}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1>{project.title}</h1>
                        <div className="meta">
                            {project.start ? <span><Date date={project.start} /> – </span> : null}
                            <Date date={project.end} />
                            {project.conductors.map((conductor) => {
                                return conductor.name;
                            })}
                        </div>
                    </div>
                    {isMember
                        ? <IconMenu
                            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            {hasEndedActivities
                                    ? <MenuItem
                                        primaryText="Vis tidligere aktiviteter"
                                        onTouchTap={this.showEnded}
                                    />
                                    : null
                            }
                            <MenuItem
                                primaryText="Rediger prosjektinfo"
                                onTouchTap={this.toggleEditProject}
                            />
                            <MenuItem
                                primaryText="Legg til aktivitet"
                                onTouchTap={this.toggleAddEvent}
                            />
                            <MenuItem
                                primaryText="Legg til repertoar"
                                onTouchTap={this.toggleAddPiece}
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
                    <div style={{ padding: '0 15px', maxWidth: 664 }}>
                        <PermissionChips
                            permissions={flattenPermissions(project.permissions)}
                            memberGroupId={org.memberGroup.id}
                        />
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
                        {project.music.length
                                ? <div>
                                    <h2>Repertoar</h2>
                                    <MusicList music={project.music} isMember={isMember} />
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
                            <img alt="Konsertplakat" src={project.poster.largePath} className="responsive" />
                            :
                            null
                        }
                        {project.events.edges.length
                                ? <div id="eventList">
                                    {project.events.edges
                                        .filter((edge) => {
                                            return this.state.showEnded || !edge.node.isEnded;
                                        })
                                        .map((edge) => {
                                            return (
                                                <EventItem
                                                    key={edge.node.id}
                                                    event={edge.node}
                                                />
                                            );
                                        })
                                    }
                                </div>
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
                        <Dialog
                            title="Legg til reperotar"
                            open={this.state.addPiece}
                            onRequestClose={this.closeAddPiece}
                            autoScrollBodyContent
                        >
                            <AutoComplete
                                floatingLabelText="Navn på stykke / komponist / arrangør"
                                dataSource={this.props.organization.pieces.edges.map((edge) => {
                                    return {
                                        text: `${edge.node.scoreCount}: ${edge.node.title} - ${edge.node.composers} (${edge.node.arrangers})`,
                                        value: edge.node,
                                    };
                                })}
                                onNewRequest={(chosen) => {
                                    this.addPiece(chosen.value);
                                }}
                                onUpdateInput={(searchTerm) => {
                                    this.searchPiece(searchTerm);
                                }}
                                filter={() => {
                                    return true;
                                }}
                                fullWidth
                                style={{ flexGrow: '1' }}
                            />
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
        showPieces: 20,
        searchTerm: '',
    },
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                groups {
                    id
                    name
                }
                ${ProjectForm.getFragment('viewer')}
            }`;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                name
                isMember
                memberGroup {
                    id
                }
                baseurl
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
                                isEnded
                                ${EventItem.getFragment('event')}
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
                                thumbnailPath
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
                    ${AddPieceMutation.getFragment('project')}
                }
                pieces(first:$showPieces,term:$searchTerm) {
                    edges {
                        node {
                            id
                            title
                            composers
                            arrangers
                            scoreCount
                        }
                    }
                }
                ${AddEventMutation.getFragment('organization')}
                ${AddFileMutation.getFragment('organization')}
                ${SaveFilePermissionsMutation.getFragment('organization')}
                ${SaveProjectMutation.getFragment('organization')}
                ${SetProjectPosterMutation.getFragment('organization')}
            }`;
        },
    },
});
