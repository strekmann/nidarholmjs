/* @flow */

import * as React from "react";

type Props = {
  value: boolean,
  maybe?: string,
  no?: string,
  yes?: string,
};

export default class Date extends React.Component<Props> {
  static defaultProps = {
    yes: "ja",
    no: "nei",
    maybe: "kanskje",
  };

  render() {
    const { yes, no, maybe } = this.props;
    if (this.props.value) {
      return <span>{yes}</span>;
    }
    if (this.props.value === undefined || this.props.value === null) {
      return <span>{maybe}</span>;
    }
    return <span>{no}</span>;
  }
}
