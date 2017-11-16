import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';

import theme from '../theme';

import EventItem from './EventItem';

const ITEMS_PER_PAGE = 20;

class Events extends React.Component {
    static propTypes = {
        organization: PropTypes.object,
        relay: PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    loadMoreEvents = () => {
        this.props.relay.refetch((variables) => {
            return {
                showItems: variables.showItems + ITEMS_PER_PAGE,
            };
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

export default createRefetchContainer(
    Events,
    {
        organization: graphql`
        fragment Events_organization on Organization
        @argumentDefinitions(
            showItems: {type: "Int", defaultValue: 20}
        )
        {
            id
            memberGroup {
                id
            }
            webdomain
            events(first: $showItems) {
                edges {
                    node {
                        id
                        ...EventItem_event
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    },
    graphql`
    query EventsRefetchQuery($showItems: Int) {
        organization {
            ...Events_organization @arguments(showItems: $showItems)
        }
    }`,
);
