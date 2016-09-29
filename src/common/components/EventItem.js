import React from 'react';
import { Link } from 'react-router';

import Daterange from './Daterange';
import Text from './Text';

export default class EventItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        title: React.PropTypes.string,
        location: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        saveEvent: React.PropTypes.func,
    }

    render() {
        return (
            <div>
                <h3><Link to={`/events/${this.props.id}`}>{this.props.title}</Link></h3>
                <div className="meta">
                    <Daterange start={this.props.start} end={this.props.end} />
                </div>
                <Text text={this.props.mdtext} />
            </div>
        );
    }
}
