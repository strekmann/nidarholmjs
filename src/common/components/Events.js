import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';

import EventItem from './EventItem';

const itemsPerPage = 10;

class Events extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
        relay: React.PropTypes.object,
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

    loadMoreEvents = () => {
        const events = this.props.organization.events;
        this.props.relay.setVariables({
            showItems: events.edges.length + itemsPerPage,
        });
    }

    render() {
        const org = this.props.organization;
        const events = org.events;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Aktiviteter</h1>
                    <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
                        <ToolbarGroup lastChild>
                            <FlatButton
                                label="Kalenderfil"
                                href={`webcal://${org.webdomain}/events/public.ics`}
                            />
                        </ToolbarGroup>
                    </Toolbar>
                </div>
                <div>
                    {events.edges.map((edge) => {
                        return (
                            <EventItem
                                key={edge.node.id}
                                event={edge.node}
                            />
                        );
                    })}
                </div>
                {events.pageInfo.hasNextPage
                        ? <RaisedButton
                            primary
                            onClick={this.loadMoreEvents}
                            label="Mer"
                        />
                        : null
                }
            </Paper>
        );
    }
}

export default Relay.createContainer(Events, {
    initialVariables: {
        showItems: itemsPerPage,
    },
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                memberGroup {
                    id
                }
                webdomain
                events(first:$showItems) {
                    edges {
                        node {
                            id
                            ${EventItem.getFragment('event')}
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
