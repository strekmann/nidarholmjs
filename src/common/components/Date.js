/* @flow */

import moment from "moment";
import * as React from "react";

type Props = {
  date: any, // react node or moment object
  format?: string,
};

export default class Date extends React.Component<Props> {
  static defaultProps = {
    format: "LL",
  };

  render() {
    if (!this.props.date) {
      return null;
    }
    const date = moment.isMoment(this.props.date)
      ? this.props.date
      : moment(this.props.date);
    let { format } = this.props;

    // If we are don't have a time, i.e. at midnight, don't show time
    // This will be buggy if we start something at midnight.
    const startd = moment(date).startOf("day");
    if (date.isSame(startd, "second")) {
      if (format === "LLL" || format === "LLLL") {
        format = "LL";
      } else if (format === "lll" || format === "llll") {
        format = "ll";
      }
    }
    const formatted = date.format(format);
    return <time dateTime={date}>{formatted}</time>;
  }
}
