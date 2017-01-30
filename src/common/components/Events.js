import Paper from 'material-ui/Paper';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import EventList from './EventList';
import theme from '../theme';

const itemsPerPage = 10;

class Events extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: React.PropTypes.object,
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
                <h1>Aktiviteter</h1>
                <EventList events={events} />
                {events.pageInfo.hasNextPage ?
                    <RaisedButton primary onClick={this.loadMoreEvents}>Mer</RaisedButton>
                    :
                    null
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
        organization: () => Relay.QL`
        fragment on Organization {
            id
            memberGroup {
                id
            }
            events(first:$showItems) {
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
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    },
});
