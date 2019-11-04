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
    const { children, email } = this.props;
    if (!email) {
      return null;
    }
    if (children) {
      const inlineLexer = new marked.InlineLexer([]);
      const mangledEmail = inlineLexer.mangle(`mailto:${email}`);
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: `<a href=${mangledEmail} className="noMargins">${renderToString(
              children,
            )}</a>`,
          }}
        />
      );
    }
    const mangledEmail = marked(`<${email}>`);
    return (
      <span
        dangerouslySetInnerHTML={{ __html: mangledEmail }}
        className="noMargins"
      />
    );
  }
}
