import Link from "found/Link";
import Avatar from "@material-ui/core/Avatar";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import * as React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import Phone from "./Phone";

type Props = {
  isMember: boolean;
  member: {
    user: {
      id: string;
      email: string;
      instrument: string;
      name: string;
      phone: string;
      profilePicture: {
        thumbnailPath: string;
      };
    };
    roles: Array<{
      id: string;
      name: string;
    }>;
    organizationRoles: Array<{
      id: string;
      name: string;
    }>;
  };
  relay: RelayProp;
};

class MemberItem extends React.Component<Props> {
  render() {
    const { user, roles, organizationRoles } = this.props.member;
    if (user) {
      const profilePicturePath =
        user.profilePicture && user.profilePicture.thumbnailPath
          ? user.profilePicture.thumbnailPath
          : undefined;
      return (
        <div>
          {this.props.isMember ? (
            <ListItem key={user.id}>
              <ListItemAvatar>
                <Avatar src={profilePicturePath} alt="" />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <span>
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
                  </span>
                }
                secondary={
                  <span>
                    <Phone phone={user.phone} />
                    {user.phone && user.email ? " – " : null}
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </span>
                }
              />
            </ListItem>
          ) : (
            <ListItem key={user.id}>
              <ListItemText
                primary={
                  <span>
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
                  </span>
                }
              />
            </ListItem>
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
