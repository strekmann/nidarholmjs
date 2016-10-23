import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Dialog from 'material-ui/Dialog';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import theme from '../theme';
import EditEventMutation from '../mutations/editEvent';
import Daterange from './Daterange';
import Text from './Text';
import EditEvent from './EditEvent';


class Event extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        organization: React.PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        edit: false,
        extra: true,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    toggleEdit = () => {
        this.setState({
            edit: !this.state.edit,
        });
    }

    closeEdit = () => {
        this.setState({
            edit: false,
        });
    }

    saveEvent = (event, closeEdit) => {
        this.context.relay.commitUpdate(new EditEventMutation({
            viewer: null,
            eventid: event.id,
            title: event.title,
            location: event.location,
            start: event.start,
            end: event.end,
            mdtext: event.mdtext,
        }), {
            onSuccess: () => {
                closeEdit();
            },
            onFailure: (error, ost, kake) => {
                console.error('AD', error, ost, kake);
            },
        });
    }

    render() {
        const event = this.props.organization.event;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{event.title}</h1>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                    </IconMenu>
                </div>
                <div className="meta">
                    {event.location} <Daterange start={event.start} end={event.end} />
                </div>
                <Text text={event.mdtext} />
                <Dialog
                    title="Rediger aktivitet"
                    open={this.state.edit}
                    onRequestClose={this.closeEdit}
                    autoScrollBodyContent
                >
                    <EditEvent
                        saveEvent={this.saveEvent}
                        closeEdit={this.closeEdit}
                        {...event}
                    />
                </Dialog>
            </Paper>
        );
    }
}

export default Relay.createContainer(Event, {
    initialVariables: {
        eventid: null,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
            ${EditEventMutation.getFragment('viewer')},
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            event(eventid:$eventid) {
                id
                title
                location
                start
                end
                tags
                mdtext
            }
        }
        `,
    },
});
