import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        date: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
    }

    render() {
        if (!this.props.date) {
            return null;
        }
        const date = moment.isMoment(this.props.date) ? this.props.date : moment(this.props.date);
        const formatted = date.fromNow();
        return (
            <time dateTime={date}>{formatted}</time>
        );
    }
}
