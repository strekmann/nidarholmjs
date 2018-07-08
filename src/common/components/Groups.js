/* @flow */

import Link from "found/lib/Link";
import Paper from "material-ui/Paper";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";

type Props = {
  organization: {
    groups: Array<{
      id: string,
      name: string,
      externallyHidden: boolean,
    }>,
  },
};

class Groups extends React.Component<Props> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

  render() {
    const { groups } = this.props.organization;
    return (
      <section>
        <Paper className="row">
          <h1>Alle grupper</h1>
          {groups.map((group) => {
            return (
              <div key={group.id}>
                <Link to={`/group/${group.id}`}>{group.name}</Link>
                {group.externallyHidden ? " h" : null}
              </div>
            );
          })}
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
      }
    }
  `,
  viewer: graphql`
    fragment Groups_viewer on User {
      id
    }
  `,
});
