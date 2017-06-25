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
        let format = this.props.format ? this.props.format : 'LL';

        // If we are don't have a time, i.e. at midnight, don't show time
        // This will be buggy if we start something at midnight.
        const startd = moment(date).startOf('day');
        if (date.isSame(startd, 'second')) {
            if (format === 'LLL' || format === 'LLLL') {
                format = 'LL';
            }
            else if (format === 'lll' || format === 'llll') {
                format = 'll';
            }
        }
        const formatted = date.format(format);
        return (
            <time dateTime={date}>{formatted}</time>
        );
    }
}
