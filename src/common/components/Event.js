import React from 'react';
import { Link } from 'react-router';

import Daterange from './Daterange';
import Text from './Text';

class Event extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
        mdtext: React.PropTypes.string,
    }

    render() {
        return (
            <div>
                <h3>{this.props.title}</h3>
                <div className="meta">
                    <Daterange start={this.props.start} end={this.props.end} />
                </div>
                <Text text={this.props.mdtext} />
            </div>
        );
    }
}

export default Event;
