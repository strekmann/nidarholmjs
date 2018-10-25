/* @flow */

import Link from "found/lib/Link";
import * as React from "react";

import { flattenPermissions } from "../utils";
import type { PermissionObject } from "../types";

import PermissionChips from "./PermissionChips";
import DateFromNow from "./DateFromNow";

type Props = {
  slug: string,
  title: string,
  permissions: PermissionObject,
  memberGroupId: string,
  creator: {
    name: string,
  },
  created: string,
  updator: {
    name: string,
  },
  updated: string,
};

export default class PageItem extends React.Component<Props> {
  render() {
    return (
      <div>
        <h3>
          <Link to={`/${this.props.slug}`}>
            {this.props.slug}
            {this.props.title ? <span> ({this.props.title})</span> : null}
          </Link>
        </h3>
        <p>
          Oppdatert for <DateFromNow date={this.props.updated} /> av{" "}
          {this.props.updator && this.props.updator.name} (Laget for{" "}
          <DateFromNow date={this.props.created} /> av{" "}
          {this.props.creator && this.props.creator.name})
        </p>
        <PermissionChips
          memberGroupId={this.props.memberGroupId}
          permissions={flattenPermissions(this.props.permissions)}
        />
      </div>
    );
  }
}
