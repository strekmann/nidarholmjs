import { withTheme, Theme } from "@material-ui/core";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import SendContactEmailMutation from "../mutations/SendContactEmail";
import { FacebookIcon } from "./FacebookIcon";
import { InstagramIcon } from "./InstagramIcon";
import { Footer_organization } from "./__generated__/Footer_organization.graphql";
import { SendContactEmailInput } from "../mutations/__generated__/SendContactEmailMutation.graphql";

type Props = {
  organization: Footer_organization;
  relay: RelayProp;
  theme: Theme;
};

type State = {
  contactDialogOpen: boolean;
};

class Footer extends React.Component<Props, State> {
  state = {
    contactDialogOpen: false,
  };

  sendEmail = (form: SendContactEmailInput) => {
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
    const { organization, theme } = this.props;

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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              width: 150,
              margin: "0 auto",
            }}
          >
            {organization.facebook && (
              <a
                href={`https://facebook.com/${organization.facebook}`}
                style={{ display: "block", width: 50 }}
              >
                <FacebookIcon fill={theme.palette.primary.dark} />
              </a>
            )}
            {organization.instagram && (
              <a
                href={`https://www.instagram.com/${organization.instagram}/`}
                style={{ display: "block", width: 50 }}
              >
                <InstagramIcon fill={theme.palette.primary.dark} />
              </a>
            )}
          </div>
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

export default withTheme(
  createFragmentContainer(Footer, {
    organization: graphql`
      fragment Footer_organization on Organization {
        facebook
        instagram
        twitter
        ...ContactForm_organization
      }
    `,
  }),
);
