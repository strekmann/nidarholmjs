import moment from 'moment';
import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        date: React.PropTypes.oneOfType([React.PropTypes.node, React.PropTypes.object]),
        format: React.PropTypes.string,
    }

    render() {
        const date = moment.isMoment(this.props.date) ? this.props.date : moment(this.props.date);
        const formatted = date.fromNow();
        return (
            <time dateTime={date}>{formatted}</time>
        );
    }
}
