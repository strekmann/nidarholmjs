import { RelayProp } from "react-relay";
import Dialog from "@material-ui/core/Dialog";
import Divider from "@material-ui/core/Divider";
import { List, ListItem } from "material-ui/List";
import Menu from "material-ui/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddEventGroupResponsibilityMutation from "../mutations/AddEventGroupResponsibility";
import RemoveEventGroupResponsibilityMutation from "../mutations/RemoveEventGroupResponsibility";

import { EventGroupResponsibilityChooser_event as Event } from "./__generated__/EventGroupResponsibilityChooser_event.graphql";
import { EventGroupResponsibilityChooser_organizationEventGroupResponsibility } from "./__generated__/EventGroupResponsibilityChooser_organizationEventGroupResponsibility.graphql";
import ChooserItem from "./ChooserItem";
import RemoveIconButton from "./RemoveIconButton";

type Props = {
  event: Event,
  organizationEventGroupResponsibility: EventGroupResponsibilityChooser_organizationEventGroupResponsibility,
  groups: Array<{ id: string, name: string }>,
  relay: RelayProp,
  selectGroup: (group: { id: string, name: string }) => void,
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

  static getDerivedStateFromProps(props, state) {
    if (props.groups !== state.groups) {
      return {
        groups: props.groups,
      };
    }
    return null;
  }

  onChooseNext = () => {
    const {
      relay,
      event,
      organizationEventGroupResponsibility,
      selectGroup,
    } = this.props;
    const { groups } = this.state;
    const group = groups[0];
    AddEventGroupResponsibilityMutation.commit(
      relay.environment,
      {
        groupId: group.id,
        eventId: event.id,
        responsibilityId: organizationEventGroupResponsibility.id,
      },
      undefined,
    );
    selectGroup(group);
  };

  onChoose = (group) => {
    const {
      relay,
      event,
      organizationEventGroupResponsibility,
      selectGroup,
    } = this.props;
    AddEventGroupResponsibilityMutation.commit(
      relay.environment,
      {
        groupId: group.id,
        eventId: event.id,
        responsibilityId: organizationEventGroupResponsibility.id,
      },
      undefined,
    );
    selectGroup(group);
    this.toggleChooser();
  };

  onRemoveContributorGroup = (contributorGroupId) => {
    const { relay, event } = this.props;
    RemoveEventGroupResponsibilityMutation.commit(
      relay.environment,
      {
        eventId: event.id,
        contributorGroupId,
      },
      undefined,
    );
  };

  toggleChooser = () => {
    this.setState((oldState) => {
      return {
        chooserOpen: !oldState.chooserOpen,
      };
    });
  };

  render() {
    const { organizationEventGroupResponsibility, event } = this.props;
    const { groups, chooserOpen } = this.state;
    const { contributorGroups } = event;
    const matchingContributorsList =
      contributorGroups &&
      contributorGroups.map((contributorGroup) => {
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
      });
    const nextButton = groups.length ? (
      <MenuItem
        onClick={this.onChooseNext}
      >{`Legg til ${groups[0].name}`}</MenuItem>
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
          <MenuItem onClick={this.toggleChooser}>Legg til …</MenuItem>
        </Menu>
        <Dialog
          title="Velg ansvarlig"
          open={chooserOpen}
          onClose={this.toggleChooser}
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
    }
  `,
});