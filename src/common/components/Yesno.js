/* @flow */

import * as React from "react";

type Props = {
  value: boolean,
  maybe?: string,
  no?: string,
  yes?: string,
};

export default class Date extends React.Component<Props> {
  render() {
    const yes = this.props.yes || "ja";
    const no = this.props.no || "nei";
    const maybe = this.props.maybe || "kanskje";
    if (this.props.value) {
      return <span>{yes}</span>;
    }
    if (this.props.value === undefined || this.props.value === null) {
      return <span>{maybe}</span>;
    }
    return <span>{no}</span>;
  }
}
