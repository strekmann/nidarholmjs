/* @flow */

import Link from "found/lib/Link";
import Avatar from "material-ui/Avatar";
import { ListItem } from "material-ui/List";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import Phone from "./Phone";

type Props = {
  isMember: boolean,
  member: {
    user: {
      id: string,
      email: string,
      instrument: string,
      name: string,
      phone: string,
      profilePicture: {
        thumbnailPath: string,
      },
    },
    roles: Array<{
      id: string,
      name: string,
    }>,
    organizationRoles: Array<{
      id: string,
      name: string,
    }>,
  },
};

class MemberItem extends React.Component<Props> {
  static propTypes = {
    isMember: PropTypes.bool,
    member: PropTypes.object,
  };

  render() {
    const { user, roles, organizationRoles } = this.props.member;
    if (user) {
      return (
        <div>
          {this.props.isMember ? (
            <ListItem
              disabled
              insetChildren
              leftAvatar={
                user.profilePicture ? (
                  <Avatar src={user.profilePicture.thumbnailPath} />
                ) : null
              }
              primaryText={
                <div>
                  <Link to={`/users/${user.id}`}>{user.name}</Link>
                  {organizationRoles.map((role) => {
                    return (
                      <span
                        key={role.id}
                        style={{ textTransform: "lowercase" }}
                      >
                        , {role.name}
                      </span>
                    );
                  })}
                  {roles.map((role) => {
                    return (
                      <span
                        key={role.id}
                        style={{ textTransform: "lowercase" }}
                      >
                        , {role.name}
                      </span>
                    );
                  })}
                  {user.instrument ? (
                    <span style={{ textTransform: "lowercase" }}>
                      , {user.instrument}
                    </span>
                  ) : null}
                </div>
              }
              secondaryText={
                <div>
                  <Phone phone={user.phone} />
                  {user.phone && user.email ? " – " : null}
                  <a href={`mailto:${user.email}`}>{user.email}</a>
                </div>
              }
            />
          ) : (
            <ListItem
              primaryText={
                <div>
                  {user.name}
                  {organizationRoles.map((role) => {
                    return (
                      <span
                        key={role.id}
                        style={{ textTransform: "lowercase" }}
                      >
                        , {role.name}
                      </span>
                    );
                  })}
                  {roles.map((role) => {
                    return (
                      <span
                        key={role.id}
                        style={{ textTransform: "lowercase" }}
                      >
                        , {role.name}
                      </span>
                    );
                  })}
                  {user.instrument ? (
                    <span style={{ textTransform: "lowercase" }}>
                      , {user.instrument}
                    </span>
                  ) : null}
                </div>
              }
            />
          )}
        </div>
      );
    }
    return null;
  }
}

export default createFragmentContainer(MemberItem, {
  member: graphql`
    fragment MemberItem_member on Member {
      id
      user(active: true) {
        id
        name
        username
        email
        phone
        membershipStatus
        instrument
        profilePicture {
          thumbnailPath
        }
      }
      roles {
        id
        name
        email
      }
      organizationRoles {
        id
        name
        email
      }
    }
  `,
});
