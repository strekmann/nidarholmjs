import moment from 'moment';
import React from 'react';

import Date from './Date';

export default class Daterange extends React.Component {
    static propTypes = {
        date: React.PropTypes.node,
    }

    render() {
        const start = this.props.start;
        const end = this.props.end;
        let startm, endm, startd, endd;
        if (start && end) {
            startm = moment.isMoment(start) ? start : moment(start);
            endm = moment.isMoment(end) ? end : moment(end);
            startd = moment(start).startOf('day');
            endd = moment(end).startOf('day');
            if (startm.isSame(endm, 'day')) {
                // same day, no time: only show one date
                if (startm.isSame(startd) && endm.isSame(endd)) {
                    return <Date date={startm} format="ll" />;
                }
                // same day, different times: show one date an one time
                return <span><Date date={startm} format="lll" /> – <Date date={endm} format="LT" /></span>;
            }
            // saving dates should always set startOf('day') AND later wholeday
            // different dates, no time: show both dates no time
            if (startm.isSame(startd) && endm.isSame(endd)) {
                return <span><Date date={startm} format="ll" /> – <Date date={endm} format="ll" /></span>;
            }
            // different dates, and times: show both dates and times
            return <span><Date date={startm} format="lll" /> – <Date date={endm} format="lll" /></span>;
        }
        if (start) {
            // only start
            startm = moment.isMoment(start) ? start : moment(start);
            startd = moment(startm).startOf('day');
            if (startm.isSame(startd, 'second')) {
                return <Date date={startm} format="ll" />;
            }
            return <Date date={startm} format="lll" />;
        }
        if (end) {
            // only end
            endm = moment.isMoment(end) ? end : moment(end);
            endd = moment(endm).startOf('day');
            if (endm.isSame(endd, 'second')) {
                return <Date date={endm} format="ll" />;
            }
            return <Date date={endm} format="lll" />;
        }
        // neither start or end
        return null;
    }
}
