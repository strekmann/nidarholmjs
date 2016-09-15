import moment from 'moment';
import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        date: React.PropTypes.string,
    }

    render() {
        const date = moment.isMoment(this.props.date) ? this.props.date : moment(this.props.date);
        return (
            <time dateTime={date}>{date.format('LL')}</time>
        );
    }
}
