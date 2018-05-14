/* @flow */

import moment from 'moment';
import * as React from 'react';

type Props = {
    date: any, // react node or moment object
}

export default class Date extends React.Component<Props> {
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
