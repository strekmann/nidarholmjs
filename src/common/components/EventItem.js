import React from 'react';
import Relay from 'react-relay';
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

class EventItem extends React.Component {
    static propTypes = {
        event: React.PropTypes.object,
    }

    state = {
        expanded: isSoon(this.props.event.start),
    }

    expandEvent = () => {
        this.setState({
            expanded: !this.state.expanded,
        });
    }

    render() {
        const { id, title, location, start, end, mdtext, isEnded } = this.props.event;
        return (
            <div
                style={{ marginBottom: 10 }}
                className={isEnded ? 'shade' : ''}
            >
                <div style={{ float: 'right' }}>
                    <IconButton
                        style={{ padding: 0, height: 'inherit', width: 'inherit' }}
                        onClick={this.expandEvent}
                    >
                        <ArrowDown />
                    </IconButton>
                </div>
                <h3 style={{ marginBottom: 0 }}>
                    <Link to={`/events/${id}`}>{title}</Link>
                </h3>
                <div className="meta">
                    <Daterange start={start} end={end} /> {location}
                </div>
                {this.state.expanded
                    ? <Text text={mdtext} />
                    : null
                }
            </div>
        );
    }
}

export default Relay.createContainer(EventItem, {
    fragments: {
        event: () => Relay.QL`
        fragment on Event {
            id
            title
            start
            end
            isEnded
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
        }`,
    },
});
