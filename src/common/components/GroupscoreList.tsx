import { List, ListItem } from "material-ui/List";
import Subheader from "material-ui/Subheader";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { GroupscoreList_groupscore } from "./__generated__/GroupscoreList_groupscore.graphql";

type Props = {
  groupscore: GroupscoreList_groupscore;
};

class GroupscoreList extends React.Component<Props> {
  render() {
    const { groupscore } = this.props;
    return (
      <List>
        <Subheader>{groupscore.name}</Subheader>
        {groupscore.files.edges.map((edge) => {
          const file = edge.node;
          return (
            <ListItem
              disabled
              key={file.id}
              primaryText={
                file.path ? (
                  <a download href={file.path}>
                    {file.filename}
                  </a>
                ) : (
                  file.filename
                )
              }
            />
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
