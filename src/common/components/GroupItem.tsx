import Link from "found/Link";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListSubheader from "@material-ui/core/ListSubheader";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { GroupItem_group } from "./__generated__/GroupItem_group.graphql";

import MemberItem from "./MemberItem";

type Props = {
  group: GroupItem_group,
  isAdmin: boolean,
  isMember: boolean,
};

class GroupItem extends React.Component<Props> {
  renderHeader() {
    const { id, name } = this.props.group;
    if (this.props.isAdmin) {
      return (
        <ListSubheader style={{ textTransform: "uppercase" }}>
          <Link to={`/group/${id}`}>{name}</Link>
        </ListSubheader>
      );
    }
    return (
      <ListSubheader style={{ textTransform: "uppercase" }}>
        {name}
      </ListSubheader>
    );
  }

  render() {
    const members =
      this.props.group.members?.filter((member) => {
        return member?.user;
      }) || [];
    if (!members.length) {
      return null;
    }
    members.sort((a, b) => {
      if (a.user.name > b.user.name) {
        return 1;
      }
      return -1;
    });
    return (
      <List>
        <Divider />
        {this.renderHeader()}
        {members.map((member) => {
          return (
            <MemberItem
              key={member.id}
              isMember={this.props.isMember}
              member={member}
            />
          );
        })}
      </List>
    );
  }
}

export default createFragmentContainer(GroupItem, {
  group: graphql`
    fragment GroupItem_group on Group {
      id
      name
      members {
        id
        user(active: true) {
          id
          name
        }
        ...MemberItem_member
      }
    }
  `,
});
