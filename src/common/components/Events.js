/* @flow */

import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ActionHelp from 'material-ui/svg-icons/action/help';
import PropTypes from 'prop-types';
import * as React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';

import theme from '../theme';

import EventItem from './EventItem';

const ITEMS_PER_PAGE = 20;

type Props = {
    organization: {
        events: {
            edges: Array<{
                node: {
                    id: string,
                },
            }>,
            pageInfo: {
                hasNextPage: boolean,
            },
        },
        webdomain: string,
    },
    relay: {
        environment: {},
        refetch: (variables: {}) => {},
    }
}

class Events extends React.Component<Props> {
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

    muiTheme: {};

    loadMoreEvents = () => {
        this.props.relay.refetch((variables) => {
            return {
                showItems: variables.showItems + ITEMS_PER_PAGE,
            };
        });
    }

    render() {
        const { organization } = this.props;
        const { events } = organization;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Aktiviteter</h1>
                    <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
                        <ToolbarGroup lastChild>
                            <FlatButton
                                label="Abonner på kalender"
                                href={`webcal://${organization.webdomain}/events/public.ics`}
                            />
                            <IconButton
                                href="/hjelp-om-aktiviteter"
                            >
                                <ActionHelp />
                            </IconButton>
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
