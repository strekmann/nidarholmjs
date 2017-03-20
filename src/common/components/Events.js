import Paper from 'material-ui/Paper';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
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
            <Paper className="row" style={{ padding: 20 }}>
                <h1>Aktiviteter</h1>
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
