import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import GridOff from "@material-ui/icons/GridOff";
import Link from "found/Link";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { Groups_organization } from "./__generated__/Groups_organization.graphql";

type Props = {
  organization: Groups_organization,
};

class Groups extends React.Component<Props> {
  render() {
    const { organization } = this.props;
    const { groups } = organization;
    return (
      <section>
        <Paper className="row">
          <h1>Alle grupper</h1>
          <List>
            {groups.map((group) => {
              return (
                <ListItem key={group.id}>
                  <ListItemText
                    primary={
                      <span>
                        <Link to={`/group/${group.id}`}>{group.name}</Link> (
                        {group.members.length})
                      </span>
                    }
                    secondary={`${group.email || ""} ${group.groupLeaderEmail ||
                      ""}`}
                  />
                  {group.externallyHidden ? (
                    <ListItemSecondaryAction>
                      <GridOff />
                    </ListItemSecondaryAction>
                  ) : null}
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </section>
    );
  }
}

export default createFragmentContainer(Groups, {
  organization: graphql`
    fragment Groups_organization on Organization {
      groups {
        id
        name
        externallyHidden
        members {
          id
        }
        email
        groupLeaderEmail
      }
    }
  `,
  viewer: graphql`
    fragment Groups_viewer on User {
      id
    }
  `,
});
