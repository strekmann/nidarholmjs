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

import type EventPersonResponsibilitiesOrganization from "./__generated__/EventPersonResponsibilities_organization.graphql";
import type EventGroupResponsibilitiesOrganization from "./__generated__/EventGroupResponsibilities_organization.graphql";
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
    organizationEventPersonResponsibilities: EventPersonResponsibilitiesOrganization,
    organizationEventGroupResponsibilities: EventGroupResponsibilitiesOrganization,
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
  eventGroupResponsibilityName: string,
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
    eventGroupResponsibilityName: "",
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

  onChangePersonResponsibility = (event, eventPersonResponsibilityName) => {
    this.setState({ eventPersonResponsibilityName });
  };

  onChangeGroupResponsibility = (event, eventGroupResponsibilityName) => {
    this.setState({ eventGroupResponsibilityName });
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
      },
      () => {
        this.setState({ eventPersonResponsibilityName: "" });
      },
    );
  };

  addEventGroupResponsibility = (event) => {
    event.preventDefault();
    AddOrganizationEventGroupResponsibilityMutation.commit(
      this.props.relay.environment,
      {
        name: this.state.eventGroupResponsibilityName,
      },
      () => {
        this.setState({ eventGroupResponsibilityName: "" });
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
                onChange={this.onChangePersonResponsibility}
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
                onChange={this.onChangeGroupResponsibility}
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
      }
      organizationEventGroupResponsibilities {
        id
        name
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
