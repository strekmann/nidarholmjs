import React from 'react';
import Relay from 'react-relay';

import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import Date from './Date';
import Text from './Text';
import EventList from './EventList';
import EditEvent from './EditEvent';
import FileList from './FileList';
import MusicList from './MusicList';
import AddEventMutation from '../mutations/addEvent';
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

    togglePublic = () => {
        this.setState({ public: !this.state.public });
    }

    toggleAddEvent = () => {
        this.setState({ addEvent: !this.state.addEvent });
    }

    closeAddEvent = () => {
        this.setState({ addEvent: false });
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

    render() {
        const viewer = this.props.viewer;
        const permissions = [];
        if (viewer) {
            permissions.push({ value: 'p', text: 'Verden' });
            viewer.groups.forEach(group => {
                permissions.push({ value: group.id, text: group.name });
            });
        }
        const project = this.props.organization.project;
        const isMember = this.props.organization.is_member;
        if (!isMember) {
            return (
                <div>
                    <h1>{project.title}</h1>
                    <div className="meta">
                        {project.start ? <span><Date date={project.start} /> – </span> : null}
                        <Date date={project.end} />
                        {project.conductors.map(conductor => conductor.name)}
                    </div>
                    <Text text={project.public_mdtext} />
                    {project.poster ?
                        <img alt="Konsertplakat" src={project.poster.large_path} />
                        :
                        null
                    }
                </div>
            );
        }
        return (
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{project.title}</h1>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem primaryText="Legg til aktivitet" onTouchTap={this.toggleAddEvent} />
                    </IconMenu>
                </div>
                <div className="meta">
                    {project.start ? <span><Date date={project.start} /> – </span> : null}
                    <Date date={project.end} />
                    {project.conductors.map(conductor => conductor.name)}
                </div>
                <RaisedButton label="Public/private" onClick={this.togglePublic} />
                <Text text={this.state.public ? project.public_mdtext : project.private_mdtext} />
                {project.poster ?
                    <img alt="Konsertplakat" src={project.poster.large_path} />
                    :
                    null
                }
                <EventList events={project.events} />
                <FileList files={project.files} />
                <MusicList music={project.music} />
                <Dialog
                    title="Legg til aktivitet"
                    open={this.state.addEvent}
                    onRequestClose={this.closeEdit}
                    autoScrollBodyContent
                >
                    <EditEvent
                        viewer={this.props.viewer}
                        saveEvent={this.saveEvent}
                        {...this.state.event}
                    />
                </Dialog>
            </section>
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
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            name
            is_member
            project(year:$year, tag:$tag) {
                title
                tag
                start
                end
                year
                public_mdtext
                private_mdtext
                conductors {
                    name
                }
                poster {
                    filename
                    large_path
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
                                groups
                                users
                            }
                        }
                    }
                }
                files(first:100) {
                    edges {
                        node {
                            id
                            filename
                            is_image
                            normal_path
                            permissions {
                                public
                                groups
                                users
                            }
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
            ${AddEventMutation.getFragment('organization')},
        }`,
    },
});
