// @flow

import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import Menu from "material-ui/Menu";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import EventPersonResponsibilityChooserItem from "./EventPersonResponsibilityChooserItem";
import type Event from "./__generated__/EventPersonResponsibilityChooser_event.graphql";

type Props = {
  event: Event,
  responsibility: string,
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
    const { responsibility, users, event } = this.props;
    return (
      <div>
        {responsibility}
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
                  userId={user.id}
                  userName={user.name}
                  responsibility={responsibility}
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
        user {
          name
        }
      }
      ...EventPersonResponsibilityChooserItem_event
    }
  `,
});
