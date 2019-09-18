/* @flow */

import Link from "found/lib/Link";
import Paper from "material-ui/Paper";
import { List, ListItem } from "material-ui/List";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import GridOff from "material-ui/svg-icons/image/grid-off";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";

type Props = {
  organization: {
    groups: Array<{
      id: string,
      name: string,
      email: string,
      externallyHidden: boolean,
      members: Array<any>,
    }>,
  },
};

class Groups extends React.Component<Props> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  muiTheme: {};

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

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
                <ListItem
                  disabled
                  key={group.id}
                  rightIcon={group.externallyHidden ? <GridOff /> : null}
                  primaryText={
                    <Link to={`/group/${group.id}`}>{group.name}</Link>
                  }
                  secondaryText={`${group.members.length} ${group.email || ""}`}
                />
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
      }
    }
  `,
  viewer: graphql`
    fragment Groups_viewer on User {
      id
    }
  `,
});
