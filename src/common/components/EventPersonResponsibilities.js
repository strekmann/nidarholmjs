// @flow

import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import EventPersonResponsibilityChooser from "./EventPersonResponsibilityChooser";
import EventPersonResponsibilitiesOrganization from "./__generated__/EventPersonResponsibilities_organization.graphql";

type Props = {
  organization: EventPersonResponsibilitiesOrganization,
};

type State = {
  selectedEvent: ?string,
  selectedResponsibility: ?string,
};

class EventPersonResponsibilities extends React.Component<Props, State> {
  flattenMemberList = (groups) => {
    let users = [];
    groups.forEach((group) => {
      const members = [];
      group.members.forEach((member) => {
        if (member.user) {
          members.push(member.user);
        }
      });
      members.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        return -1;
      });
      users = users.concat(members);
    });
    return users;
  };
  render() {
    const {
      events,
      instrumentGroups,
      organizationEventPersonResponsibilities,
    } = this.props.organization;
    const users = this.flattenMemberList(instrumentGroups);
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th />
              {organizationEventPersonResponsibilities.map((responsibility) => {
                return <th key={responsibility}>{responsibility}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {events.edges.map((edge) => {
              return (
                <tr key={edge.node.id}>
                  <th>{edge.node.title}</th>
                  {organizationEventPersonResponsibilities.map(
                    (responsibility) => {
                      return (
                        <td key={`${edge.node.id}-${responsibility}`}>
                          <EventPersonResponsibilityChooser
                            responsibility={responsibility}
                            eventId={edge.node.id}
                            users={users}
                            event={edge.node}
                          />
                        </td>
                      );
                    },
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default createFragmentContainer(EventPersonResponsibilities, {
  organization: graphql`
    fragment EventPersonResponsibilities_organization on Organization
      @argumentDefinitions(showItems: { type: "Int", defaultValue: 20 }) {
      organizationEventPersonResponsibilities
      instrumentGroups {
        members {
          user(active: true) {
            id
            name
          }
        }
      }
      events(first: $showItems) {
        edges {
          node {
            ...EventPersonResponsibilityChooser_event
            title
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
});
