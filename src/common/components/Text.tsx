/* eslint "react/no-danger": 0 */

import marked from "marked";
import * as React from "react";

type Props = {
  text?: string | null;
};

export default class Text extends React.Component<Props> {
  static defaultProps = {
    text: "",
  };

  render() {
    const { text } = this.props;
    const html = marked(text || "");
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  }
}
