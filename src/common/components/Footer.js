/* @flow */

import { createFragmentContainer, graphql } from "react-relay";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";

import theme from "../theme";
import SendContactEmailMutation from "../mutations/SendContactEmail";

import ContactForm from "./ContactForm";

type Props = {
  organization: {
    facebook: string,
    instagram: string,
    twitter: string,
  },
  relay: {
    environment: {},
  },
};

type State = {
  contactDialogOpen: boolean,
};

class Footer extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  state = {
    contactDialogOpen: false,
  };

  getChildContext() {
    return { muiTheme: getMuiTheme(theme) };
  }

  sendEmail = (form) => {
    const { relay } = this.props;
    SendContactEmailMutation.commit(relay.environment, form);
  };

  openEmailDialog = () => {
    this.setState({ contactDialogOpen: true });
  };

  closeEmailDialog = () => {
    this.setState({ contactDialogOpen: false });
  };

  render() {
    const { organization } = this.props;
    return (
      <footer>
        <div
          className="header"
          style={{
            fontSize: "1.0rem",
            textAlign: "center",
            marginTop: 50,
            marginBottom: 80,
          }}
        >
          <ContactForm
            open={this.state.contactDialogOpen}
            close={this.closeEmailDialog}
            save={this.sendEmail}
            organization={organization}
          />
          <a onClick={this.openEmailDialog} style={{ cursor: "pointer" }}>
            Kontaktskjema
          </a>{" "}
          ·{" "}
          <a href={`https://facebook.com/${organization.facebook}`}>Facebook</a>{" "}
          ·{" "}
          <a href={`https://www.instagram.com/${organization.instagram}/`}>
            Instagram
          </a>{" "}
          · <a href={`https://twitter.com/${organization.twitter}`}>Twitter</a>
          <div
            className="header"
            style={{
              fontSize: "1.0rem",
              marginTop: 20,
            }}
          >
            <a href="/personvern">Personvern</a> ·{" "}
            <a href="https://gitlab.com/strekmann/nidarholmjs/issues">
              Feilrapportering
            </a>{" "}
            · <a href="https://gitlab.com/strekmann/nidarholmjs">Kildekode</a>
            <div style={{ marginTop: 10 }}>© Musikkforeningen Nidarholm</div>
          </div>
        </div>
      </footer>
    );
  }
}

export default createFragmentContainer(
  Footer,
  graphql`
    fragment Footer_organization on Organization {
      facebook
      instagram
      twitter
      ...ContactForm_organization
    }
  `,
);
