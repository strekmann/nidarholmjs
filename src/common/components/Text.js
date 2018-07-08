/* eslint "react/no-danger": 0 */
/* @flow */

import marked from "8fold-marked";
import * as React from "react";

type Props = {
  text?: string,
};

export default class Text extends React.Component<Props> {
  render() {
    if (!this.props.text) {
      return null;
    }
    const text = marked(this.props.text);
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }
}
