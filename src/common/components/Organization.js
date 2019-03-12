/* @flow */

import update from "immutability-helper";
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
import SaveOrganizationMutation from "../mutations/SaveOrganization";
import theme from "../theme";

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

  onChangePersonResponsibilityName = (event, eventPersonResponsibilityName) => {
    this.setState({ eventPersonResponsibilityName });
  };

  onChangePersonResponsibilityReminderText = (
    event,
    eventPersonResponsibilityReminderText,
  ) => {
    this.setState({ eventPersonResponsibilityReminderText });
  };

  onChangePersonResponsibilityReminderAtHour = (
    event,
    eventPersonResponsibilityReminderAtHour,
  ) => {
    this.setState({ eventPersonResponsibilityReminderAtHour });
  };

  onChangePersonResponsibilityReminderDaysBefore = (
    event,
    eventPersonResponsibilityReminderDaysBefore,
  ) => {
    this.setState({ eventPersonResponsibilityReminderDaysBefore });
  };

  onChangeGroupResponsibilityName = (event, eventGroupResponsibilityName) => {
    this.setState({ eventGroupResponsibilityName });
  };

  onChangeGroupResponsibilityReminderText = (
    event,
    eventGroupResponsibilityReminderText,
  ) => {
    this.setState({ eventGroupResponsibilityReminderText });
  };

  onChangeGroupResponsibilityReminderAtHour = (
    event,
    eventGroupResponsibilityReminderAtHour,
  ) => {
    this.setState({ eventGroupResponsibilityReminderAtHour });
  };

  onChangeGroupResponsibilityReminderDaysBefore = (
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
            <ul>
              {personResponsibilities.map((responsibility) => {
                return <li key={responsibility.id}>{responsibility.name}</li>;
              })}
            </ul>
            <form onSubmit={this.addEventPersonResponsibility}>
              <TextField
                floatingLabelText="Navn"
                value={this.state.eventPersonResponsibilityName}
                onChange={this.onChangePersonResponsibilityName}
              />
              <TextField
                floatingLabelText="Epostinnhold"
                value={this.state.eventPersonResponsibilityReminderText}
                onChange={this.onChangePersonResponsibilityReminderText}
              />
              <TextField
                floatingLabelText="Sendes klokka"
                value={this.state.eventPersonResponsibilityReminderAtHour}
                onChange={this.onChangePersonResponsibilityReminderAtHour}
              />
              <TextField
                floatingLabelText="Dager i forveien"
                value={this.state.eventPersonResponsibilityReminderDaysBefore}
                onChange={this.onChangePersonResponsibilityReminderDaysBefore}
              />
              <RaisedButton label="Lagre" type="submit" />
            </form>
            <h2>Aktivitetsansvarlige - grupper</h2>
            <p>
              Her defineres gruppeansvar som kan tilordnes aktiviteter i lister.
              For eksempel sjauing.
            </p>
            <ul>
              {groupResponsibilities.map((responsibility) => {
                return <li key={responsibility.id}>{responsibility.name}</li>;
              })}
            </ul>
            <form onSubmit={this.addEventGroupResponsibility}>
              <TextField
                floatingLabelText="Navn"
                value={this.state.eventGroupResponsibilityName}
                onChange={this.onChangeGroupResponsibilityName}
              />
              <TextField
                floatingLabelText="Epostinnhold"
                value={this.state.eventGroupResponsibilityReminderText}
                onChange={this.onChangeGroupResponsibilityReminderText}
              />
              <TextField
                floatingLabelText="Sendes klokka"
                value={this.state.eventGroupResponsibilityReminderAtHour}
                onChange={this.onChangeGroupResponsibilityReminderAtHour}
              />
              <TextField
                floatingLabelText="Dager i forveien"
                value={this.state.eventGroupResponsibilityReminderDaysBefore}
                onChange={this.onChangeGroupResponsibilityReminderDaysBefore}
              />
              <RaisedButton label="Lagre" type="submit" />
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
