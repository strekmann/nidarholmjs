import { RelayProp } from "react-relay";
import Dialog from "material-ui/Dialog";
import Divider from "material-ui/Divider";
import Menu from "material-ui/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddEventPersonResponsibilityMutation from "../mutations/AddEventPersonResponsibility";
import RemoveEventPersonResponsibilityMutation from "../mutations/RemoveEventPersonResponsibility";

import { EventPersonResponsibilityChooser_event as Event } from "./__generated__/EventPersonResponsibilityChooser_event.graphql";
import { EventPersonResponsibilityChooser_organizationEventPersonResponsibility } from "./__generated__/EventPersonResponsibilityChooser_organizationEventPersonResponsibility.graphql";
import ChooserItem from "./ChooserItem";
import RemoveIconButton from "./RemoveIconButton";

type Props = {
  event: Event,
  organizationEventPersonResponsibility: EventPersonResponsibilityChooser_organizationEventPersonResponsibility,
  users: Array<{ id: string, name: string }>,
  relay: RelayProp,
  selectUser: (user: { id: string, name: string }) => void,
};

type State = {
  chooserOpen: boolean,
  users: Array<{ id: string, name: string }>,
};

class EventPersonResponsibilityChooser extends React.Component<Props, State> {
  state = {
    chooserOpen: false,
    users: [],
  };

  static getDerivedStateFromProps(props, state) {
    if (props.users !== state.users) {
      return {
        users: props.users,
      };
    }
    return null;
  }

  onChooseNext = () => {
    const {
      relay,
      event,
      organizationEventPersonResponsibility,
      selectUser,
    } = this.props;
    const { users } = this.state;
    const user = users[0];
    AddEventPersonResponsibilityMutation.commit(relay.environment, {
      userId: user.id,
      eventId: event.id,
      responsibilityId: organizationEventPersonResponsibility.id,
    });
    selectUser(user);
  };

  onChoose = (user) => {
    const {
      relay,
      event,
      organizationEventPersonResponsibility,
      selectUser,
    } = this.props;
    AddEventPersonResponsibilityMutation.commit(relay.environment, {
      userId: user.id,
      eventId: event.id,
      responsibilityId: organizationEventPersonResponsibility.id,
    });
    selectUser(user);
    this.toggleChooser();
  };

  onRemoveContributor = (contributorId) => {
    const { relay, event } = this.props;
    RemoveEventPersonResponsibilityMutation.commit(relay.environment, {
      eventId: event.id,
      contributorId,
    });
  };

  toggleChooser = () => {
    this.setState((oldState) => {
      return {
        chooserOpen: !oldState.chooserOpen,
      };
    });
  };

  render() {
    const { organizationEventPersonResponsibility, event } = this.props;
    const { users } = this.state;
    const { contributors } = event;
    const matchingContributorsList = contributors.map((contributor) => {
      return contributor.role.id ===
        organizationEventPersonResponsibility.id ? (
        <div key={contributor.id}>
          {contributor.user.name}
          <div>
            <RemoveIconButton
              item={contributor.id}
              onRemove={this.onRemoveContributor}
            />
          </div>
        </div>
      ) : null;
    });
    const nextButton = users.length ? (
      <MenuItem
        onClick={this.onChooseNext}
      >{`Legg til ${users[0].name}`}</MenuItem>
    ) : null;
    const chooserItems = users.map((user) => {
      return (
        <ChooserItem
          key={user.id}
          item={user}
          responsibility={organizationEventPersonResponsibility}
          event={event}
          onChoose={this.onChoose}
        />
      );
    });
    return (
      <div>
        <div>{matchingContributorsList}</div>
        <Divider />
        <Menu>
          {nextButton}
          <MenuItem onClick={this.toggleChooser}>Legg til …</MenuItem>
        </Menu>
        <Dialog
          title="Velg ansvarlig"
          open={this.state.chooserOpen}
          onRequestClose={this.toggleChooser}
          autoScrollBodyContent={true}
        >
          <Menu>{chooserItems}</Menu>
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
        role {
          id
          name
        }
      }
    }
  `,
  organizationEventPersonResponsibility: graphql`
    fragment EventPersonResponsibilityChooser_organizationEventPersonResponsibility on OrganizationEventPersonResponsibility {
      id
      name
    }
  `,
});
