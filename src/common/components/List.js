/* @flow */

import * as React from "react";

type Props = {
  items: Array<any>,
};

export default class List extends React.Component<Props> {
  render() {
    const { items } = this.props;
    const and = "og";
    if (!items || items.length === 0) {
      return <span />;
    }
    if (items.length === 1) {
      return <span>{items[0]}</span>;
    }
    if (items.length === 2) {
      return (
        <span>
          {items[0]} {and} {items[1]}
        </span>
      );
    }
    return (
      <span>
        {items.slice(0, -1).join(", ")} {and} {items[items.length - 1]}
      </span>
    );
  }
}
