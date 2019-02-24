// @flow

import type { RelayRefetchProp } from "react-relay";
import MenuItem from "material-ui/MenuItem";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddEventPersonResponsibilityMutation from "../mutations/AddEventPersonResponsibility";

import type Event from "./__generated__/EventPersonResponsibilityChooserItem_event.graphql";

type Props = {
  userId: string,
  userName: string,
  responsibility: string,
  relay: RelayRefetchProp,
  event: Event,
  onSelect: () => {},
};
type State = {};

class EventPersonResponsibilityChooserItem extends React.Component<
  Props,
  State,
> {
  onChoose = () => {
    const { userId, event, responsibility, relay, onSelect } = this.props;
    onSelect();
    AddEventPersonResponsibilityMutation.commit(relay.environment, {
      userId,
      eventId: event.id,
      responsibility,
    });
  };

  render() {
    const { userName } = this.props;
    return <MenuItem primaryText={userName} onClick={this.onChoose} />;
  }
}

export default createFragmentContainer(EventPersonResponsibilityChooserItem, {
  event: graphql`
    fragment EventPersonResponsibilityChooserItem_event on Event {
      id
    }
  `,
});
