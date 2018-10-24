/* eslint "react/no-danger": 0 */
/* @flow */

import marked from "marked";
import * as React from "react";
import { renderToString } from "react-dom/server";

type Props = {
  email?: string,
  children?: React.Node,
};

export default class Email extends React.Component<Props> {
  static defaultProps = {
    children: null,
    email: null,
  };

  render() {
    if (!this.props.email) {
      return null;
    }
    if (this.props.children) {
      const inlineLexer = new marked.InlineLexer([]);
      const email = inlineLexer.mangle(`mailto:${this.props.email}`);
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: `<a href=${email} className="noMargins">${renderToString(
              this.props.children,
            )}</a>`,
          }}
        />
      );
    }
    const email = marked(`<${this.props.email}>`);
    return (
      <span dangerouslySetInnerHTML={{ __html: email }} className="noMargins" />
    );
  }
}
