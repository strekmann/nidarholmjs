import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { GroupscoreList_groupscore } from "./__generated__/GroupscoreList_groupscore.graphql";

type Props = {
  groupscore: GroupscoreList_groupscore,
};

class GroupscoreList extends React.Component<Props> {
  render() {
    const { groupscore } = this.props;
    return (
      <List>
        <ListSubheader>{groupscore.name}</ListSubheader>
        {groupscore.files.edges.map((edge) => {
          const file = edge.node;
          return (
            <ListItem key={file.id}>
              <ListItemText
                primary={
                  file.path ? (
                    <a download href={file.path}>
                      {file.filename}
                    </a>
                  ) : (
                    file.filename
                  )
                }
              />
            </ListItem>
          );
        })}
      </List>
    );
  }
}

export default createFragmentContainer(GroupscoreList, {
  groupscore: graphql`
    fragment GroupscoreList_groupscore on Groupscore {
      name
      files {
        edges {
          node {
            id
            filename
            path
          }
        }
      }
    }
  `,
});
