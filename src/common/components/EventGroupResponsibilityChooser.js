// @flow

import type { RelayRefetchProp } from "react-relay";
import Dialog from "material-ui/Dialog";
import Divider from "material-ui/Divider";
import { List, ListItem } from "material-ui/List";
import Menu from "material-ui/Menu";
import MenuItem from "material-ui/MenuItem";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddEventGroupResponsibilityMutation from "../mutations/AddEventGroupResponsibility";
import RemoveEventGroupResponsibilityMutation from "../mutations/RemoveEventGroupResponsibility";

import type Event from "./__generated__/EventGroupResponsibilityChooser_event.graphql";
import type OrganizationEventGroupResponsibility from "./__generated__/EventGroupResponsibilityChooser_organizationEventGroupResponsibility.graphql";
import ChooserItem from "./ChooserItem";
import RemoveIconButton from "./RemoveIconButton";

type Props = {
  event: Event,
  organizationEventGroupResponsibility: OrganizationEventGroupResponsibility,
  groups: Array<{ id: string, name: string }>,
  relay: RelayRefetchProp,
};

type State = {
  chooserOpen: boolean,
  groups: Array<{ id: string, name: string }>,
};

class EventGroupResponsibilityChooser extends React.Component<Props, State> {
  state = {
    chooserOpen: false,
    groups: [],
  };

  componentWillMount = () => {
    this.setState({
      groups: this.orderGroups(
        this.props.groups,
        this.props.organizationEventGroupResponsibility.last,
      ),
    });
  };

  onChooseNext = () => {
    const { relay, event, organizationEventGroupResponsibility } = this.props;
    const group = this.state.groups[0];
    AddEventGroupResponsibilityMutation.commit(relay.environment, {
      groupId: group.id,
      eventId: event.id,
      responsibilityId: organizationEventGroupResponsibility.id,
    });
    this.setState({ groups: this.orderGroups(this.state.groups, group) });
  };

  onChoose = (group) => {
    const { relay, event, organizationEventGroupResponsibility } = this.props;
    AddEventGroupResponsibilityMutation.commit(relay.environment, {
      groupId: group.id,
      eventId: event.id,
      responsibilityId: organizationEventGroupResponsibility.id,
    });
    this.setState({ groups: this.orderGroups(this.state.groups, group) });
    this.toggleChooser();
  };

  onRemoveContributorGroup = (contributorGroupId) => {
    const { relay, event } = this.props;
    RemoveEventGroupResponsibilityMutation.commit(relay.environment, {
      eventId: event.id,
      contributorGroupId,
    });
  };

  toggleChooser = () => {
    this.setState((oldState) => {
      return {
        chooserOpen: !oldState.chooserOpen,
      };
    });
  };

  orderGroups = (groups, lastGroup) => {
    if (!lastGroup) {
      return groups;
    }
    const lastIndex = groups.findIndex((group) => {
      return group.id === lastGroup.id;
    });
    if (lastIndex < 0) {
      return groups;
    }
    return groups
      .slice(lastIndex + 1, groups.length)
      .concat(groups.slice(0, lastIndex + 1));
  };

  render() {
    const { organizationEventGroupResponsibility, event } = this.props;
    const { groups } = this.state;
    const { contributorGroups } = event;
    const matchingContributorsList = contributorGroups.map(
      (contributorGroup) => {
        return contributorGroup.role.id ===
          organizationEventGroupResponsibility.id ? (
          <ListItem
            key={contributorGroup.id}
            disabled
            rightIconButton={
              <RemoveIconButton
                item={contributorGroup.id}
                onRemove={this.onRemoveContributorGroup}
              />
            }
          >
            {contributorGroup.group.name}
          </ListItem>
        ) : null;
      },
    );
    const nextButton = groups.length ? (
      <MenuItem
        primaryText={`Legg til ${groups[0].name}`}
        onTouchTap={this.onChooseNext}
      />
    ) : null;
    const chooserItems = groups.map((group) => {
      return (
        <ChooserItem
          key={group.id}
          item={group}
          responsibility={organizationEventGroupResponsibility}
          event={event}
          onChoose={this.onChoose}
        />
      );
    });
    return (
      <div>
        <List>{matchingContributorsList}</List>
        <Divider />
        <Menu>
          {nextButton}
          <MenuItem primaryText="Legg til …" onTouchTap={this.toggleChooser} />
        </Menu>
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

export default createFragmentContainer(EventGroupResponsibilityChooser, {
  event: graphql`
    fragment EventGroupResponsibilityChooser_event on Event {
      id
      contributorGroups {
        id
        group {
          name
        }
        role {
          id
          name
        }
      }
    }
  `,
  organizationEventGroupResponsibility: graphql`
    fragment EventGroupResponsibilityChooser_organizationEventGroupResponsibility on OrganizationEventGroupResponsibility {
      id
      name
      last {
        id
      }
    }
  `,
});
