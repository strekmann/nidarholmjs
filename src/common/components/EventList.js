import React from 'react';

import Event from './Event';

export default class EventList extends React.Component {
    static propTypes = {
        events: React.PropTypes.object,
    }
    render() {
        return (
            <div>
                {this.props.events.edges.map(edge => (
                    <Event key={edge.node.id} {...edge.node} />
                    ))
                }
            </div>
        );
    }
}
