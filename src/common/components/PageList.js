/* @flow */

import * as React from "react";

import type PagesOrganization from "./__generated__/Pages_organization.graphql";
import PageItem from "./PageItem";

type Props = {
  memberGroupId: string,
  pages: {
    edges: Array<{
      node: PagesOrganization,
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
