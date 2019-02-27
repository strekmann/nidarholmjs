// @flow

import type { RelayRefetchProp } from "react-relay";
import MenuItem from "material-ui/MenuItem";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddEventPersonResponsibilityMutation from "../mutations/AddEventPersonResponsibility";

import type Event from "./__generated__/EventPersonResponsibilityChooserItem_event.graphql";
import type OrganizationEventPersonResponsibility from "./__generated__/EventPersonResponsibilityChooser_organizationEventPersonResponsibility.graphql";

type Props = {
  user: {
    id: string,
    name: string,
  },
  responsibility: OrganizationEventPersonResponsibility,
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
    const { user, event, responsibility, relay, onSelect } = this.props;
    onSelect();
    AddEventPersonResponsibilityMutation.commit(relay.environment, {
      userId: user.id,
      eventId: event.id,
      responsibilityId: responsibility.id,
    });
  };

  render() {
    const { user } = this.props;
    console.log(this.props, "o");
    return <MenuItem primaryText={user.name} onClick={this.onChoose} />;
  }
}

export default createFragmentContainer(EventPersonResponsibilityChooserItem, {
  event: graphql`
    fragment EventPersonResponsibilityChooserItem_event on Event {
      id
    }
  `,
});
