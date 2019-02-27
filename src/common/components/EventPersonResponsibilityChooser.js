// @flow

import { fromGlobalId } from "graphql-relay";
import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import Menu from "material-ui/Menu";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import EventPersonResponsibilityChooserItem from "./EventPersonResponsibilityChooserItem";
import type Event from "./__generated__/EventPersonResponsibilityChooser_event.graphql";
import type OrganizationEventPersonResponsibility from "./__generated__/EventPersonResponsibilityChooser_organizationEventPersonResponsibility.graphql";

type Props = {
  event: Event,
  organizationEventPersonResponsibility: OrganizationEventPersonResponsibility,
  users: Array<{ id: string, name: string }>,
};

type State = {
  chooserOpen: boolean,
};

class EventPersonResponsibilityChooser extends React.Component<Props, State> {
  state = {
    chooserOpen: false,
  };

  toggleChooser = () => {
    this.setState((oldState) => {
      return {
        chooserOpen: !oldState.chooserOpen,
      };
    });
  };

  render() {
    const { organizationEventPersonResponsibility, users, event } = this.props;
    const { contributors } = event;
    return (
      <div>
        {organizationEventPersonResponsibility.name}
        <ul>
          {contributors.map((contributor) => {
            return contributor.role ===
              fromGlobalId(organizationEventPersonResponsibility.id).id ? (
              <li key={contributor.id}>{contributor.user.name}</li>
            ) : null;
          })}
        </ul>
        <RaisedButton label="Legg til" onTouchTap={this.toggleChooser} />
        <Dialog
          title="Velg ansvarlig"
          open={this.state.chooserOpen}
          onRequestClose={this.toggleChooser}
          autoScrollBodyContent
        >
          <Menu>
            {users.map((user) => {
              return (
                <EventPersonResponsibilityChooserItem
                  key={user.id}
                  user={user}
                  responsibility={organizationEventPersonResponsibility}
                  event={event}
                  onSelect={this.toggleChooser}
                />
              );
            })}
          </Menu>
        </Dialog>
      </div>
    );
  }
}

export default createFragmentContainer(EventPersonResponsibilityChooser, {
  event: graphql`
    fragment EventPersonResponsibilityChooser_event on Event {
      id
      contributors {
        id
        user {
          name
        }
        role
      }
      ...EventPersonResponsibilityChooserItem_event
    }
  `,
  organizationEventPersonResponsibility: graphql`
    fragment EventPersonResponsibilityChooser_organizationEventPersonResponsibility on OrganizationEventPersonResponsibility {
      id
      name
    }
  `,
});
