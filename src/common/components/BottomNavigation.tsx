import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";
import Paper from "@material-ui/core/Paper";
import ActionDateRange from "@material-ui/icons/DateRange";
import NotificationEventNote from "@material-ui/icons/EventNote";
import SocialGroupIcon from "@material-ui/icons/Group";
import Link from "found/Link";
import indigo from "@material-ui/core/colors/indigo";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { BottomNavigation_organization } from "./__generated__/BottomNavigation_organization.graphql";

type Props = {
  organization: BottomNavigation_organization,
};

class Navigation extends React.Component<Props> {
  render() {
    if (this.props.organization.isMember) {
      return (
        <Paper
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
          }}
          className="hide-desktop"
        >
          <BottomNavigation
            style={{
              backgroundColor: indigo[50],
            }}
          >
            <BottomNavigationAction
              label="Prosjekter"
              icon={<NotificationEventNote />}
              component={Link}
              to="/projects"
              style={{ textAlign: "center" }}
            />
            <BottomNavigationAction
              label="Aktiviteter"
              icon={<ActionDateRange />}
              component={Link}
              to="/events"
              style={{ textAlign: "center" }}
            />
            <BottomNavigationAction
              label="Medlemmer"
              icon={<SocialGroupIcon />}
              component={Link}
              to="/members"
              style={{ textAlign: "center" }}
            />
          </BottomNavigation>
        </Paper>
      );
    }
    return null;
  }
}

export default createFragmentContainer(Navigation, {
  organization: graphql`
    fragment BottomNavigation_organization on Organization {
      id
      isMember
    }
  `,
});
