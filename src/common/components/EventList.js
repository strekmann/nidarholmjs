import React from 'react';

import EventItem from './EventItem';

export default class EventList extends React.Component {
    static propTypes = {
        events: React.PropTypes.object,
        saveEvent: React.PropTypes.func,
    }
    render() {
        return (
            <div id="eventList">
                {this.props.events.edges.map(edge => (
                    <EventItem key={edge.node.id} {...edge.node} saveEvent={this.props.saveEvent} />
                    ))
                }
            </div>
        );
    }
}
