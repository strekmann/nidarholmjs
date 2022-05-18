/* eslint "react/no-danger": 0 */

import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Link from "found/Link";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import SendContactEmailMutation from "../mutations/SendContactEmail";
import ContactForm from "./ContactForm";
import EventItem from "./EventItem";
import ProjectItem from "./ProjectItem";
import Text from "./Text";
import { Home_organization } from "./__generated__/Home_organization.graphql";
import { withTheme, Theme } from "@material-ui/core";
import { SendContactEmailInput } from "../mutations/__generated__/SendContactEmailMutation.graphql";
import Map from "./Map";

type Props = {
  organization: Home_organization;
  relay: RelayProp;
  theme: Theme;
};

type State = {
  contactDialogOpen: boolean;
};

class Home extends React.Component<Props, State> {
  state = {
    contactDialogOpen: false,
  };

  sendEmail = (form: SendContactEmailInput) => {
    const { organization, relay } = this.props;
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
    const { contactDialogOpen } = this.state;
    const { nextProjects, nextEvents, summaries } = organization;
    return (
      <div id="home">
        <div
          style={{
            backgroundImage: "url(/img/nidarholm-kimen.jpg)",
            backgroundPosition: "25% 10%",
            backgroundSize: "cover",
            height: "30vw",
            position: "relative",
          }}
        >
          <h1
            className="giant-image-text"
            style={{
              marginTop: 0,
              paddingTop: "3vw",
              textAlign: "center",
              color: "rgba(255,255,255,0.6)",
              display: "none",
            }}
          >
            {organization.name}
          </h1>
        </div>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div className="grid">
            <div
              id="next-projects"
              className="item"
              style={{ display: "flex", flexDirection: "column" }}
            >
              {nextProjects && (
                <>
                  <h1>
                    {nextProjects.edges?.length ?? 0 > 1
                      ? "Neste prosjekter"
                      : "Neste prosjekt"}
                  </h1>
                  {nextProjects.edges?.map((edge) => {
                    return (
                      <ProjectItem
                        key={edge?.node?.id}
                        project={edge?.node}
                        showText
                      />
                    );
                  })}
                </>
              )}
              <Link to="/projects">
                <Button variant="text">Prosjektoversikt</Button>
              </Link>
            </div>
            <div
              id="next-events"
              className="item"
              style={{ display: "flex", flexDirection: "column" }}
            >
              {nextEvents && (
                <>
                  <h1>Neste aktiviteter</h1>
                  {nextEvents.edges?.map((edge) => {
                    return (
                      <EventItem key={edge?.node?.id} event={edge?.node} />
                    );
                  })}
                </>
              )}
              <Link to="/events">
                <Button variant="text">Aktivitetskalender</Button>
              </Link>
            </div>
            {summaries && summaries.length > 0 ? (
              <Paper
                id="information"
                className="item"
                style={{
                  paddingLeft: theme.spacing(2),
                  paddingRight: theme.spacing(2),
                }}
              >
                <h2>
                  <Link to={`/${summaries[0]?.slug}`}>
                    {summaries[0]?.title}
                  </Link>
                </h2>
                <Text text={summaries[0]?.summary} />
                <Link to={`/${summaries[0]?.slug}`}>Les mer</Link>
              </Paper>
            ) : null}
            {summaries && summaries.length > 1 ? (
              <Paper
                className="item"
                style={{
                  paddingLeft: theme.spacing(2),
                  paddingRight: theme.spacing(2),
                }}
              >
                <h2>
                  <Link to={`/${summaries[1]?.slug}`}>
                    {summaries[1]?.title}
                  </Link>
                </h2>
                <Text text={summaries[1]?.summary} />
                <Link to={`/${summaries[1]?.slug}`}>Les mer</Link>
              </Paper>
            ) : null}
            {summaries && summaries.length > 2 ? (
              <Paper
                className="item"
                style={{
                  paddingLeft: theme.spacing(2),
                  paddingRight: theme.spacing(2),
                }}
              >
                <h2>
                  <Link to={`/${summaries[2]?.slug}`}>
                    {summaries[2]?.title}
                  </Link>
                </h2>
                <Text text={summaries[2]?.summary} />
                <Link to={`/${summaries[2]?.slug}`}>Les mer</Link>
              </Paper>
            ) : null}
            <Paper
              id="contact"
              className="item"
              style={{
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
              }}
            >
              <ContactForm
                open={contactDialogOpen}
                close={this.closeEmailDialog}
                save={this.sendEmail}
                organization={organization}
              />
              <h2 style={{ display: "inline-block" }}>
                <Link to="/contact">Kontakt</Link>
              </h2>
              <div
                className="small-narrow"
                style={{
                  display: "flex",
                  marginLeft: -theme.spacing(2),
                  marginRight: -theme.spacing(2),
                }}
              >
                <div
                  style={{
                    flex: "2 1 66%",
                    height: 300,
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                  }}
                >
                  <Map />
                </div>
                <div
                  style={{
                    flex: "1 1 33%",
                    paddingLeft: theme.spacing(2),
                    paddingRight: theme.spacing(2),
                  }}
                >
                  <h3>E-post</h3>
                  <a onClick={this.openEmailDialog} role="button">
                    <span
                      dangerouslySetInnerHTML={{
                        __html: organization.encodedEmail ?? "",
                      }}
                    />
                  </a>
                  <h3>Øvelser</h3>
                  <Text text={organization.contactText} />
                </div>
              </div>
            </Paper>
          </div>
          <img
            src="/img/spons/Reitan_RGB_Blue.png"
            alt="Hovedsponsor: Reitan"
            style={{
              width: "50%",
              margin: "0 auto",
              display: "block",
            }}
          />
        </div>
      </div>
    );
  }
}

export default withTheme(
  createFragmentContainer(Home, {
    viewer: graphql`
      fragment Home_viewer on User {
        id
        name
        email
        username
      }
    `,
    organization: graphql`
      fragment Home_organization on Organization {
        id
        name
        encodedEmail
        mapUrl
        contactText
        summaries {
          title
          summary
          slug
        }
        nextProjects(first: 3) {
          edges {
            node {
              id
              ...ProjectItem_project
            }
          }
        }
        nextEvents(first: 4) {
          edges {
            node {
              id
              ...EventItem_event
            }
          }
        }
        ...ContactForm_organization
      }
    `,
  }),
);
