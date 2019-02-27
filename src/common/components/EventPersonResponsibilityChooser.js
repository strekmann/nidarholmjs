// @flow

import type { RelayRefetchProp } from "react-relay";
import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import Menu from "material-ui/Menu";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddEventPersonResponsibilityMutation from "../mutations/AddEventPersonResponsibility";

import type Event from "./__generated__/EventPersonResponsibilityChooser_event.graphql";
import type OrganizationEventPersonResponsibility from "./__generated__/EventPersonResponsibilityChooser_organizationEventPersonResponsibility.graphql";
import EventPersonResponsibilityChooserItem from "./EventPersonResponsibilityChooserItem";

type Props = {
  event: Event,
  organizationEventPersonResponsibility: OrganizationEventPersonResponsibility,
  users: Array<{ id: string, name: string }>,
  relay: RelayRefetchProp,
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

  componentWillMount = () => {
    this.setState({
      users: this.orderUsers(
        this.props.users,
        this.props.organizationEventPersonResponsibility.last,
      ),
    });
  };

  onChooseNext = () => {
    const { relay, event, organizationEventPersonResponsibility } = this.props;
    const user = this.state.users[0];
    AddEventPersonResponsibilityMutation.commit(relay.environment, {
      userId: user.id,
      eventId: event.id,
      responsibilityId: organizationEventPersonResponsibility.id,
    });
    this.setState({ users: this.orderUsers(this.state.users, user) });
  };

  onChoose = (user) => {
    const { relay, event, organizationEventPersonResponsibility } = this.props;
    AddEventPersonResponsibilityMutation.commit(relay.environment, {
      userId: user.id,
      eventId: event.id,
      responsibilityId: organizationEventPersonResponsibility.id,
    });
    this.setState({ users: this.orderUsers(this.state.users, user) });
    this.toggleChooser();
  };

  toggleChooser = () => {
    this.setState((oldState) => {
      return {
        chooserOpen: !oldState.chooserOpen,
      };
    });
  };

  orderUsers = (users, lastUser) => {
    if (!lastUser) {
      return users;
    }
    const lastIndex = users.findIndex((user) => {
      return user.id === lastUser.id;
    });
    if (lastIndex < 0) {
      return users;
    }
    return users
      .slice(lastIndex + 1, users.length)
      .concat(users.slice(0, lastIndex + 1));
  };

  render() {
    const { organizationEventPersonResponsibility, event } = this.props;
    const { users } = this.state;
    const { contributors } = event;
    const matchingContributorsList = contributors.map((contributor) => {
      return contributor.role.id ===
        organizationEventPersonResponsibility.id ? (
        <li key={contributor.id}>{contributor.user.name}</li>
      ) : null;
    });
    const nextButton = users.length ? (
      <RaisedButton
        label={`Legg til ${users[0].name}`}
        onTouchTap={this.onChooseNext}
      />
    ) : null;
    const chooserItems = users.map((user) => {
      return (
        <EventPersonResponsibilityChooserItem
          key={user.id}
          user={user}
          responsibility={organizationEventPersonResponsibility}
          event={event}
          onChoose={this.onChoose}
        />
      );
    });
    return (
      <div>
        <ul>{matchingContributorsList}</ul>
        {nextButton}
        <RaisedButton label="Legg til …" onTouchTap={this.toggleChooser} />
        <Dialog
          title="Velg ansvarlig"
          open={this.state.chooserOpen}
          onRequestClose={this.toggleChooser}
          autoScrollBodyContent
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
      last {
        id
      }
    }
  `,
});
