import moment from 'moment';
import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        date: React.PropTypes.oneOfType([React.PropTypes.node, React.PropTypes.object]),
        format: React.PropTypes.string,
    }

    render() {
        if (!this.props.date) {
            return null;
        }
        const date = moment.isMoment(this.props.date) ? this.props.date : moment(this.props.date);
        const format = this.props.format ? this.props.format : 'LL';
        const formatted = date.format(format);
        return (
            <time dateTime={date}>{formatted}</time>
        );
    }
}
