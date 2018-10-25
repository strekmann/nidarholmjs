/* @flow */

import * as React from "react";

import type { Page } from "../types";

import PageItem from "./PageItem";

type Props = {
  memberGroupId: string,
  pages: {
    edges: Array<{
      node: Page,
    }>,
  },
};

export default class PageList extends React.Component<Props> {
  render() {
    return (
      <div>
        {this.props.pages.edges.map((edge) => {
          return (
            <PageItem
              key={edge.node.id}
              memberGroupId={this.props.memberGroupId}
              {...edge.node}
            />
          );
        })}
      </div>
    );
  }
}
