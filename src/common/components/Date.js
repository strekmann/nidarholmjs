import moment from 'moment';
import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        date: React.PropTypes.node,
        format: React.PropTypes.string,
    }

    render() {
        const date = moment.isMoment(this.props.date) ? this.props.date : moment(this.props.date);
        const format = this.props.format ? this.props.format : 'LL';
        const formatted = date.format(format);
        return (
            <time dateTime={date}>{formatted}</time>
        );
    }
}
