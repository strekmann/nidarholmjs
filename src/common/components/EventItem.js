import React from 'react';
import { Link } from 'react-router';
import IconButton from 'material-ui/IconButton';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import moment from 'moment';

import Daterange from './Daterange';
import Text from './Text';

function isSoon(date) {
    if (!date) {
        return false;
    }
    const mdate = moment(date);
    if (mdate >= moment().startOf('day') && mdate < moment().add(1, 'week').startOf('day')) {
        return true;
    }
    return false;
}

function isEnded(start, end) {
    // if start or end of event is before start of today, it is no longer
    // interesting
    if (!start) {
        return false;
    }
    if (end) {
        if (moment(end) < moment().startOf('day')) {
            return true;
        }
    }
    if (moment(start) < moment().startOf('day')) {
        return true;
    }
    return false;
}

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

    state = {
        expanded: isSoon(this.props.start),
    }

    expandEvent = () => {
        this.setState({
            expanded: !this.state.expanded,
        });
    }

    render() {
        return (
            <div
                style={{ marginBottom: 10 }}
                className={isEnded(this.props.start, this.props.end) ? 'shade' : ''}
            >
                <div style={{ float: 'right' }}>
                    <IconButton onClick={this.expandEvent}><ArrowDown /></IconButton>
                </div>
                <h3 style={{ marginBottom: 0 }}>
                    <Link to={`/events/${this.props.id}`}>{this.props.title}</Link>
                </h3>
                <div className="meta">
                    <Daterange start={this.props.start} end={this.props.end} />
                </div>
                {this.state.expanded
                    ? <Text text={this.props.mdtext} />
                    : null
                }
            </div>
        );
    }
}
