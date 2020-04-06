/* eslint "react/no-danger": 0 */

import marked from "marked";
import * as React from "react";

type Props = {
  text?: string;
};

export default class Text extends React.Component<Props> {
  static defaultProps = {
    text: "",
  };

  render() {
    const text = marked(this.props.text || "");
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }
}
