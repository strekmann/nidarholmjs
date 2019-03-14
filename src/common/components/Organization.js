/* @flow */

import update from "immutability-helper";
import { List } from "material-ui/List";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import { Tab, Tabs } from "material-ui/Tabs";
import TextField from "material-ui/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import AddOrganizationEventPersonResponsibilityMutation from "../mutations/AddOrganizationEventPersonResponsibility";
import AddOrganizationEventGroupResponsibilityMutation from "../mutations/AddOrganizationEventGroupResponsibility";
import SaveOrganizationEventPersonResponsibilityMutation from "../mutations/SaveOrganizationEventPersonResponsibility";
import SaveOrganizationEventGroupResponsibilityMutation from "../mutations/SaveOrganizationEventGroupResponsibility";
import SaveOrganizationMutation from "../mutations/SaveOrganization";
import theme from "../theme";

import OrganizationResponsibilityItem from "./OrganizationResponsibilityItem";
import FrontpageSummaries from "./FrontpageSummaries";

type Props = {
  organization: {
    pages: {
      edges: Array<{
        node: {
          id: string,
          key: string,
          slug: string,
          title: string,
        },
        cursor: string,
      }>,
    },
    summaries: Array<{
      id: string,
      slug: string,
      title: string,
    }>,
    organizationEventPersonResponsibilities: Array<{
      id: string,
      name: string,
      reminderDaysBefore: number,
      reminderAtHour: number,
      reminderText: string,
    }>,
    organizationEventGroupResponsibilities: Array<{
      id: string,
      name: string,
      reminderDaysBefore: number,
      reminderAtHour: number,
      reminderText: string,
    }>,
  },
  relay: {
    environment: {},
  },
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
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

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

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onChange = (summaries) => {
    this.setState({ summaries });
  };

  onChangeTab = (tab: string) => {
    this.setState({ tab });
  };

  onChangeEventPersonResponsibilityName = (
    event,
    eventPersonResponsibilityName,
  ) => {
    this.setState({ eventPersonResponsibilityName });
  };

  onChangeEventPersonResponsibilityReminderText = (
    event,
    eventPersonResponsibilityReminderText,
  ) => {
    this.setState({ eventPersonResponsibilityReminderText });
  };

  onChangeEventPersonResponsibilityReminderAtHour = (
    event,
    eventPersonResponsibilityReminderAtHour,
  ) => {
    this.setState({ eventPersonResponsibilityReminderAtHour });
  };

  onChangeEventPersonResponsibilityReminderDaysBefore = (
    event,
    eventPersonResponsibilityReminderDaysBefore,
  ) => {
    this.setState({ eventPersonResponsibilityReminderDaysBefore });
  };

  onChangeEventGroupResponsibilityName = (
    event,
    eventGroupResponsibilityName,
  ) => {
    this.setState({ eventGroupResponsibilityName });
  };

  onChangeEventGroupResponsibilityReminderText = (
    event,
    eventGroupResponsibilityReminderText,
  ) => {
    this.setState({ eventGroupResponsibilityReminderText });
  };

  onChangeEventGroupResponsibilityReminderAtHour = (
    event,
    eventGroupResponsibilityReminderAtHour,
  ) => {
    this.setState({ eventGroupResponsibilityReminderAtHour });
  };

  onChangeEventGroupResponsibilityReminderDaysBefore = (
    event,
    eventGroupResponsibilityReminderDaysBefore,
  ) => {
    this.setState({ eventGroupResponsibilityReminderDaysBefore });
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

  muiTheme: {};

  saveOrganization = (event) => {
    event.preventDefault();
    SaveOrganizationMutation.commit(this.props.relay.environment, {
      summaryIds: this.state.summaries.map((page) => {
        return page.id;
      }),
    });
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
    id,
    name,
    reminderText,
    reminderAtHour,
    reminderDaysBefore,
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
    );
  };

  saveGroupResponsibility = (
    id,
    name,
    reminderText,
    reminderAtHour,
    reminderDaysBefore,
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
              <RaisedButton type="submit" label="Lagre" />
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
                  floatingLabelText="Navn"
                  value={this.state.eventPersonResponsibilityName}
                  onChange={this.onChangeEventPersonResponsibilityName}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Epostinnhold"
                  fullWidth
                  multiLine
                  value={this.state.eventPersonResponsibilityReminderText}
                  onChange={this.onChangeEventPersonResponsibilityReminderText}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Sendes klokka"
                  type="number"
                  value={this.state.eventPersonResponsibilityReminderAtHour}
                  onChange={
                    this.onChangeEventPersonResponsibilityReminderAtHour
                  }
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Dager i forveien"
                  type="number"
                  value={this.state.eventPersonResponsibilityReminderDaysBefore}
                  onChange={
                    this.onChangeEventPersonResponsibilityReminderDaysBefore
                  }
                />
              </div>
              <div>
                <RaisedButton label="Lagre" type="submit" />
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
                  floatingLabelText="Navn"
                  value={this.state.eventGroupResponsibilityName}
                  onChange={this.onChangeEventGroupResponsibilityName}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Epostinnhold"
                  fullWidth
                  multiLine
                  value={this.state.eventGroupResponsibilityReminderText}
                  onChange={this.onChangeEventGroupResponsibilityReminderText}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Sendes klokka"
                  type="number"
                  value={this.state.eventGroupResponsibilityReminderAtHour}
                  onChange={this.onChangeEventGroupResponsibilityReminderAtHour}
                />
              </div>
              <div>
                <TextField
                  floatingLabelText="Dager i forveien"
                  type="number"
                  value={this.state.eventGroupResponsibilityReminderDaysBefore}
                  onChange={
                    this.onChangeEventGroupResponsibilityReminderDaysBefore
                  }
                />
              </div>
              <div>
                <RaisedButton label="Lagre" type="submit" />
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
