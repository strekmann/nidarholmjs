/* @flow */

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Chip from 'material-ui/Chip';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import theme from '../theme';
import EditEventMutation from '../mutations/EditEvent';
import DeleteEventMutation from '../mutations/DeleteEvent';

import Daterange from './Daterange';
import Text from './Text';
import EventForm from './EventForm';


type Props = {
    organization: {
        event: {
            id: string,
            title: string,
            location: string,
            start: string,
            end: string,
            mdtext: string,
            projects: Array<{
                id: string,
                title: string,
                year: string,
                tag: string,
            }>,
        },
        isMember: boolean,
    },
    relay: {
        environment: {},
    },
    router: {
        go: (number) => void,
        push: ({
            pathname: string,
        }) => void,
    },
    viewer: {},
}

type State = {
    editing: boolean,
    deleting: boolean,
}

class Event extends React.Component<Props, State> {
    muiTheme: {};

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        editing: false,
        deleting: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    toggleEdit = () => {
        this.setState({
            editing: !this.state.editing,
        });
    }

    toggleDelete = () => {
        this.setState({ deleting: !this.state.deleting });
    }

    closeEdit = () => {
        this.setState({
            editing: false,
        });
    }

    closeDelete = () => {
        this.setState({ deleting: false });
    }

    saveEvent = (event) => {
        const { relay } = this.props;
        this.setState({ editing: false });
        EditEventMutation.commit(
            relay.environment,
            {
                eventid: event.id,
                title: event.title,
                location: event.location,
                start: event.start,
                end: event.end,
                mdtext: event.mdtext,
                permissions: event.permissions,
                tags: event.tags,
                highlighted: event.highlighted,
            },
        );
    }

    deleteEvent = () => {
        const { organization, relay } = this.props;
        DeleteEventMutation.commit(
            relay.environment,
            {
                id: organization.event.id,
            },
            () => {
                this.props.router.go(-1);
            },
        );
    }

    goTo = (project) => {
        const { year, tag } = project;
        this.props.router.push({ pathname: `/${year}/${tag}` });
    }

    render() {
        const { organization, viewer } = this.props;
        const { event, isMember } = organization;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{event.title}</h1>
                    {isMember
                        ? (
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                                <MenuItem primaryText="Slett" onTouchTap={this.toggleDelete} />
                            </IconMenu>
                        )
                        : null
                    }
                </div>
                <div className="meta">
                    {event.location} <Daterange start={event.start} end={event.end} />
                </div>
                <Text text={event.mdtext} />
                {event.projects.map((project) => {
                    return (
                        <Chip
                            key={project.id}
                            onTouchTap={() => {
                                this.goTo(project);
                            }}
                        >
                            {project.title}
                        </Chip>
                    );
                })}
                {isMember
                    ? (
                        <div>
                            <EventForm
                                event={event}
                                organization={this.props.organization}
                                viewer={viewer}
                                isOpen={this.state.editing}
                                title="Rediger aktivitet"
                                save={this.saveEvent}
                                cancel={this.closeEdit}
                            />
                            <Dialog
                                title="Slett aktivitet"
                                open={this.state.deleting}
                                onRequestClose={this.closeDelete}
                                autoScrollBodyContent
                                actions={[
                                    <FlatButton onTouchTap={this.closeDelete} label="Avbryt" />,
                                    <FlatButton primary onTouchTap={this.deleteEvent} label="Slett" />,
                                ]}
                            >
                                <p>{event.title}</p>
                            </Dialog>
                        </div>
                    )
                    : null
                }
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Event,
    {
        viewer: graphql`
        fragment Event_viewer on User {
            id
            ...EventForm_viewer
        }`,
        organization: graphql`
        fragment Event_organization on Organization {
            isMember
            event(eventid: $eventId) {
                id
                title
                location
                start
                end
                projects {
                    id
                    year
                    tag
                    title
                }
                mdtext
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
                highlighted
            }
            ...EventForm_organization
        }`,
    },
);
