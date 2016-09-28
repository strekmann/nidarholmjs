import React from 'react';

import Event from './Event';

export default class EventList extends React.Component {
    static propTypes = {
        events: React.PropTypes.object,
        saveEvent: React.PropTypes.func,
    }
    render() {
        return (
            <div>
                {this.props.events.edges.map(edge => (
                    <Event key={edge.node.id} {...edge.node} saveEvent={this.props.saveEvent} />
                    ))
                }
            </div>
        );
    }
}
