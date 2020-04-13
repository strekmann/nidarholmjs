import update from "immutability-helper";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import { Tab, Tabs } from "material-ui/Tabs";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddOrganizationEventPersonResponsibilityMutation from "../mutations/AddOrganizationEventPersonResponsibility";
import AddOrganizationEventGroupResponsibilityMutation from "../mutations/AddOrganizationEventGroupResponsibility";
import SaveOrganizationEventPersonResponsibilityMutation from "../mutations/SaveOrganizationEventPersonResponsibility";
import SaveOrganizationEventGroupResponsibilityMutation from "../mutations/SaveOrganizationEventGroupResponsibility";
import SaveOrganizationMutation from "../mutations/SaveOrganization";

import OrganizationResponsibilityItem from "./OrganizationResponsibilityItem";
import FrontpageSummaries from "./FrontpageSummaries";
import { Organization_organization } from "./__generated__/Organization_organization.graphql";

type Props = {
  organization: Organization_organization,
  relay: RelayProp,
};

type State = {
  summaries: Array<{
    id: string,
    slug: string,
    title: string,
  }>,
  tab: string,
  eventPersonResponsibilityName: string,
  eventPersonResponsibilityReminderText: string,
  eventPersonResponsibilityReminderDaysBefore: number,
  eventPersonResponsibilityReminderAtHour: number,
  eventGroupResponsibilityName: string,
  eventGroupResponsibilityReminderText: string,
  eventGroupResponsibilityReminderDaysBefore: number,
  eventGroupResponsibilityReminderAtHour: number,
};

class Organization extends React.Component<Props, State> {
  state = {
    summaries: this.props.organization.summaries,
    tab: "frontpage",
    eventPersonResponsibilityName: "",
    eventPersonResponsibilityReminderText: "",
    eventPersonResponsibilityReminderDaysBefore: 0,
    eventPersonResponsibilityReminderAtHour: 0,
    eventGroupResponsibilityName: "",
    eventGroupResponsibilityReminderText: "",
    eventGroupResponsibilityReminderDaysBefore: 0,
    eventGroupResponsibilityReminderAtHour: 0,
  };

  onChange = (summaries) => {
    this.setState({ summaries });
  };

  onChangeTab = (tab: string) => {
    this.setState({ tab });
  };

  onChangeEventPersonResponsibilityName = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({ eventPersonResponsibilityName: event.target.value });
  };

  onChangeEventPersonResponsibilityReminderText = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({
      eventPersonResponsibilityReminderText: event.target.value,
    });
  };

  onChangeEventPersonResponsibilityReminderAtHour = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({
      eventPersonResponsibilityReminderAtHour: parseInt(event.target.value, 10),
    });
  };

  onChangeEventPersonResponsibilityReminderDaysBefore = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({
      eventPersonResponsibilityReminderDaysBefore: parseInt(
        event.target.value,
        10,
      ),
    });
  };

  onChangeEventGroupResponsibilityName = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({ eventGroupResponsibilityName: event.target.value });
  };

  onChangeEventGroupResponsibilityReminderText = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({ eventGroupResponsibilityReminderText: event.target.value });
  };

  onChangeEventGroupResponsibilityReminderAtHour = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({
      eventGroupResponsibilityReminderAtHour: parseInt(event.target.value, 10),
    });
  };

  onChangeEventGroupResponsibilityReminderDaysBefore = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    this.setState({
      eventGroupResponsibilityReminderDaysBefore: parseInt(
        event.target.value,
        10,
      ),
    });
  };

  onAdd = (page) => {
    this.setState(
      update(this.state, {
        summaries: {
          $push: [page],
        },
      }),
    );
  };

  saveOrganization = (event) => {
    event.preventDefault();
    SaveOrganizationMutation.commit(
      this.props.relay.environment,
      {
        summaryIds: this.state.summaries.map((page) => {
          return page.id;
        }),
      },
      undefined,
    );
  };

  addEventPersonResponsibility = (event) => {
    event.preventDefault();
    AddOrganizationEventPersonResponsibilityMutation.commit(
      this.props.relay.environment,
      {
        name: this.state.eventPersonResponsibilityName,
        reminderText: this.state.eventPersonResponsibilityReminderText,
        reminderAtHour: this.state.eventPersonResponsibilityReminderAtHour,
        reminderDaysBefore: this.state
          .eventPersonResponsibilityReminderDaysBefore,
      },
      () => {
        this.setState({
          eventPersonResponsibilityName: "",
          eventPersonResponsibilityReminderText: "",
          eventPersonResponsibilityReminderAtHour: 0,
          eventPersonResponsibilityReminderDaysBefore: 0,
        });
      },
    );
  };

  addEventGroupResponsibility = (event) => {
    event.preventDefault();
    AddOrganizationEventGroupResponsibilityMutation.commit(
      this.props.relay.environment,
      {
        name: this.state.eventGroupResponsibilityName,
        reminderText: this.state.eventGroupResponsibilityReminderText,
        reminderAtHour: this.state.eventGroupResponsibilityReminderAtHour,
        reminderDaysBefore: this.state
          .eventGroupResponsibilityReminderDaysBefore,
      },
      () => {
        this.setState({
          eventGroupResponsibilityName: "",
          eventGroupResponsibilityReminderText: "",
          eventGroupResponsibilityReminderAtHour: 0,
          eventGroupResponsibilityReminderDaysBefore: 0,
        });
      },
    );
  };

  savePersonResponsibility = (
    id: string,
    name: string,
    reminderText: string,
    reminderAtHour: number,
    reminderDaysBefore: number,
  ) => {
    SaveOrganizationEventPersonResponsibilityMutation.commit(
      this.props.relay.environment,
      {
        id,
        name,
        reminderText,
        reminderAtHour,
        reminderDaysBefore,
      },
      undefined,
    );
  };

  saveGroupResponsibility = (
    id: string,
    name: string,
    reminderText: string,
    reminderAtHour: number,
    reminderDaysBefore: number,
  ) => {
    SaveOrganizationEventGroupResponsibilityMutation.commit(
      this.props.relay.environment,
      {
        id,
        name,
        reminderText,
        reminderAtHour,
        reminderDaysBefore,
      },
      undefined,
    );
  };

  render() {
    const org = this.props.organization;
    const personResponsibilities = org.organizationEventPersonResponsibilities;
    const groupResponsibilities = org.organizationEventGroupResponsibilities;
    return (
      <Paper className="row">
        <h1>Innstillinger</h1>
        <Tabs value={this.state.tab} onChange={this.onChangeTab}>
          <Tab label="Forside" value="frontpage">
            <form onSubmit={this.saveOrganization}>
              <FrontpageSummaries
                pages={org.pages}
                summaries={this.state.summaries}
                onChange={this.onChange}
                onAdd={this.onAdd}
              />
              <Button variant="contained" type="submit">
                Lagre
              </Button>
            </form>
          </Tab>
          <Tab label="Ansvarslister" value="responsibilities">
            <h2>Aktivitetsansvarlige - personer</h2>
            <p>
              Her defineres ansvarsroller som kan tilordnes aktiviteter i
              lister. For eksempel kakeansvar.
            </p>
            <List>
              {personResponsibilities.map((responsibility) => {
                return (
                  <OrganizationResponsibilityItem
                    key={responsibility.id}
                    item={responsibility}
                    onSave={this.savePersonResponsibility}
                  />
                );
              })}
            </List>
            <form onSubmit={this.addEventPersonResponsibility}>
              <h3>Nytt personansvar</h3>
              <div>
                <TextField
                  label="Navn"
                  value={this.state.eventPersonResponsibilityName}
                  onChange={this.onChangeEventPersonResponsibilityName}
                />
              </div>
              <div>
                <TextField
                  label="Epostinnhold"
                  fullWidth
                  multiline
                  value={this.state.eventPersonResponsibilityReminderText}
                  onChange={this.onChangeEventPersonResponsibilityReminderText}
                />
              </div>
              <div>
                <TextField
                  label="Sendes klokka"
                  type="number"
                  value={this.state.eventPersonResponsibilityReminderAtHour}
                  onChange={
                    this.onChangeEventPersonResponsibilityReminderAtHour
                  }
                />
              </div>
              <div>
                <TextField
                  label="Dager i forveien"
                  type="number"
                  value={this.state.eventPersonResponsibilityReminderDaysBefore}
                  onChange={
                    this.onChangeEventPersonResponsibilityReminderDaysBefore
                  }
                />
              </div>
              <div>
                <Button variant="contained" type="submit">
                  Lagre
                </Button>
              </div>
            </form>
            <h2>Aktivitetsansvarlige - grupper</h2>
            <p>
              Her defineres gruppeansvar som kan tilordnes aktiviteter i lister.
              For eksempel sjauing.
            </p>
            <List>
              {groupResponsibilities.map((responsibility) => {
                return (
                  <OrganizationResponsibilityItem
                    key={responsibility.id}
                    item={responsibility}
                    onSave={this.saveGroupResponsibility}
                  />
                );
              })}
            </List>
            <form onSubmit={this.addEventGroupResponsibility}>
              <h3>Nytt gruppeansvar</h3>
              <div>
                <TextField
                  label="Navn"
                  value={this.state.eventGroupResponsibilityName}
                  onChange={this.onChangeEventGroupResponsibilityName}
                />
              </div>
              <div>
                <TextField
                  label="Epostinnhold"
                  fullWidth
                  multiline
                  value={this.state.eventGroupResponsibilityReminderText}
                  onChange={this.onChangeEventGroupResponsibilityReminderText}
                />
              </div>
              <div>
                <TextField
                  label="Sendes klokka"
                  type="number"
                  value={this.state.eventGroupResponsibilityReminderAtHour}
                  onChange={this.onChangeEventGroupResponsibilityReminderAtHour}
                />
              </div>
              <div>
                <TextField
                  label="Dager i forveien"
                  type="number"
                  value={this.state.eventGroupResponsibilityReminderDaysBefore}
                  onChange={
                    this.onChangeEventGroupResponsibilityReminderDaysBefore
                  }
                />
              </div>
              <div>
                <Button variant="contained" type="submit">
                  Lagre
                </Button>
              </div>
            </form>
          </Tab>
        </Tabs>
      </Paper>
    );
  }
}

export default createFragmentContainer(Organization, {
  organization: graphql`
    fragment Organization_organization on Organization {
      id
      summaries {
        id
        title
        slug
      }
      organizationEventPersonResponsibilities {
        id
        name
        reminderDaysBefore
        reminderAtHour
        reminderText
      }
      organizationEventGroupResponsibilities {
        id
        name
        reminderDaysBefore
        reminderAtHour
        reminderText
      }
      pages(first: 100) {
        edges {
          cursor
          node {
            id
            title
            slug
          }
        }
      }
    }
  `,
});
