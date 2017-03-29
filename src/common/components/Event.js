import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import theme from '../theme';
import EditEventMutation from '../mutations/editEvent';
import DeleteEventMutation from '../mutations/deleteEvent';

import Daterange from './Daterange';
import Text from './Text';
import EventForm from './EventForm';


class Event extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        organization: React.PropTypes.object,
        viewer: React.PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        editing: false,
        deleting: false,
        extra: true,
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
        this.setState({ editing: false });
        this.context.relay.commitUpdate(new EditEventMutation({
            viewer: null,
            eventid: event.id,
            title: event.title,
            location: event.location,
            start: event.start,
            end: event.end,
            mdtext: event.mdtext,
            permissions: event.permissions,
        }));
    }

    deleteEvent = () => {
        const { organization } = this.props;
        this.context.relay.commitUpdate(new DeleteEventMutation({
            event: organization.event,
            organization,
        }), {
            onSuccess: () => {
                this.context.router.goBack();
            },
        });
    }

    render() {
        const { event, isMember } = this.props.organization;
        const viewer = this.props.viewer;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{event.title}</h1>
                    {isMember
                            ? <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                                <MenuItem primaryText="Slett" onTouchTap={this.toggleDelete} />
                            </IconMenu>
                            : null
                    }
                </div>
                <div className="meta">
                    {event.location} <Daterange start={event.start} end={event.end} />
                </div>
                <Text text={event.mdtext} />
                {isMember
                    ? <div>
                        <EventForm
                            event={event}
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
                    : null
                }
            </Paper>
        );
    }
}

export default Relay.createContainer(Event, {
    initialVariables: {
        eventid: null,
    },
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
                ${EventForm.getFragment('viewer')}
                ${EditEventMutation.getFragment('viewer')},
            }`;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isMember
                event(eventid:$eventid) {
                    id
                    title
                    location
                    start
                    end
                    tags
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
                    ${DeleteEventMutation.getFragment('event')}
                }
            }`;
        },
    },
});
