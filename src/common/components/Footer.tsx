import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";

import theme from "../theme";
import SendContactEmailMutation from "../mutations/SendContactEmail";

import { Footer_organization } from "./__generated__/Footer_organization.graphql";
import ContactForm from "./ContactForm";

type Props = {
  organization: Footer_organization;
  relay: RelayProp;
};

type State = {
  contactDialogOpen: boolean;
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

    const links: JSX.Element[] = [
      <a
        key="form"
        onClick={this.openEmailDialog}
        style={{ cursor: "pointer" }}
      >
        Kontaktskjema
      </a>,
    ];
    if (organization.facebook) {
      links.push(<span key="facebook-span"> · </span>);
      links.push(
        <a
          key="facebook"
          href={`https://facebook.com/${organization.facebook}`}
        >
          Facebook
        </a>,
      );
    }
    if (organization.instagram) {
      links.push(<span key="instagram-span"> · </span>);
      links.push(
        <a
          key="instagram"
          href={`https://www.instagram.com/${organization.instagram}/`}
        >
          Instagram
        </a>,
      );
    }
    if (organization.twitter) {
      links.push(<span key="twitter-span"> · </span>);
      links.push(
        <a key="twitter" href={`https://twitter.com/${organization.twitter}`}>
          Twitter
        </a>,
      );
    }

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
          {links}
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

export default createFragmentContainer(Footer, {
  organization: graphql`
    fragment Footer_organization on Organization {
      facebook
      instagram
      twitter
      ...ContactForm_organization
    }
  `,
});
