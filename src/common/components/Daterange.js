/* @flow */

import moment from "moment";
import * as React from "react";

import Date from "./Date";

type Props = {
  start: any,
  end: any,
  noTime?: boolean,
};

export default class Daterange extends React.Component<Props> {
  static defaultProps = {
    noTime: false,
  };

  render() {
    const { start, end } = this.props;
    let startm;
    let endm;
    let startd;
    let endd;
    if (start && end) {
      startm = moment.isMoment(start) ? start : moment(start);
      endm = moment.isMoment(end) ? end : moment(end);
      startd = moment(start).startOf("day");
      endd = moment(end).startOf("day");
      if (startm.isSame(endm, "day")) {
        // same day, no time: only show one date
        if (this.props.noTime || (startm.isSame(startd) && endm.isSame(endd))) {
          return <Date date={startm} format="ll" />;
        }
        // same day, different times: show one full date AND end time only
        return (
          <span>
            <Date date={startm} format="lll" /> –{" "}
            <Date date={endm} format="LT" />
          </span>
        );
      }
      // saving dates should always set startOf('day') AND later wholeday
      // different dates, no time: show both dates no time
      if (this.props.noTime || (startm.isSame(startd) && endm.isSame(endd))) {
        return (
          <span>
            <Date date={startm} format="ll" /> –{" "}
            <Date date={endm} format="ll" />
          </span>
        );
      }
      // different dates, and times: show both dates and times
      return (
        <span>
          <Date date={startm} format="lll" /> –{" "}
          <Date date={endm} format="lll" />
        </span>
      );
    }
    if (start) {
      // only start
      startm = moment.isMoment(start) ? start : moment(start);
      startd = moment(startm).startOf("day");
      if (startm.isSame(startd, "second")) {
        return <Date date={startm} format="ll" />;
      }
      return <Date date={startm} format="lll" />;
    }
    if (end) {
      // only end
      endm = moment.isMoment(end) ? end : moment(end);
      endd = moment(endm).startOf("day");
      if (endm.isSame(endd, "second")) {
        return <Date date={endm} format="ll" />;
      }
      return <Date date={endm} format="lll" />;
    }
    // neither start or end
    return null;
  }
}
