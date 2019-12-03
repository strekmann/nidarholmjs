/* @flow */
/* eslint "react/no-danger": 0 */

import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardText,
  CardTitle,
} from "material-ui/Card";
import FlatButton from "material-ui/FlatButton";
import Paper from "material-ui/Paper";
import PropTypes from "prop-types";
import Link from "found/lib/Link";

import theme from "../theme";
import SendContactEmailMutation from "../mutations/SendContactEmail";

import ContactForm from "./ContactForm";
import Date from "./Date";
import EventItem from "./EventItem";
import Text from "./Text";
import type HomeOrganization from "./__generated__/Home_organization.graphql";

type Props = {
  organization: HomeOrganization,
  relay: {
    environment: {},
  },
};

type State = {
  contactDialogOpen: boolean,
};

class Home extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  muiTheme: {};

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    contactDialogOpen: false,
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  sendEmail = (form) => {
    const { organization, relay } = this.props;
    SendContactEmailMutation.commit(relay.environment, organization, form);
  };

  openEmailDialog = () => {
    this.setState({ contactDialogOpen: true });
  };

  closeEmailDialog = () => {
    this.setState({ contactDialogOpen: false });
  };

  render() {
    const { organization } = this.props;
    const { contactDialogOpen } = this.state;
    const { nextProject } = organization;
    const { desktopGutterLess } = theme.spacing;
    return (
      <div id="home">
        <div
          style={{
            backgroundImage: "url(/img/musikkforeningen-nidarholm.jpg)",
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
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              paddingRight: desktopGutterLess,
              paddingLeft: desktopGutterLess,
              color: theme.palette.accent3Color,
            }}
          ></div>
        </div>
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div className="grid">
            {nextProject
              ? [
                  <Card
                    id="next-projects"
                    key="next-projects"
                    className="item"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <CardHeader
                      title={<h2 style={{ margin: 0 }}>Neste prosjekt</h2>}
                    />
                    {nextProject.poster ? (
                      <CardMedia
                        overlay={
                          <Link to={`/${nextProject.year}/${nextProject.tag}`}>
                            <CardTitle
                              title={nextProject.title}
                              titleStyle={{ color: "white" }}
                            />
                          </Link>
                        }
                      >
                        <img
                          alt="Prosjektplakat"
                          className="responsive"
                          src={nextProject.poster.normalPath}
                        />
                      </CardMedia>
                    ) : (
                      <Link to={`/${nextProject.year}/${nextProject.tag}`}>
                        <CardTitle title={nextProject.title} />
                      </Link>
                    )}
                    <CardText>
                      {nextProject.events.edges.map((edge) => {
                        const event = edge.node;
                        return (
                          <div className="meta" key={event.id}>
                            {event.location}{" "}
                            <Date date={event.start} format="LLL" />
                          </div>
                        );
                      })}
                      {!nextProject.events.edges.length ? (
                        <div className="meta" style={{ fontWeight: "bold" }}>
                          <Date date={nextProject.end} />
                        </div>
                      ) : null}
                      <Text text={nextProject.publicMdtext} />
                    </CardText>
                    <CardActions>
                      <Link to="/projects">
                        <FlatButton label="Prosjektoversikt" />
                      </Link>
                    </CardActions>
                  </Card>,
                  <Card
                    id="next-events"
                    key="next-events"
                    className="item"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-start",
                    }}
                  >
                    <CardHeader
                      title={<h2 style={{ margin: 0 }}>Neste aktiviteter</h2>}
                    />
                    <CardText id="eventList">
                      {organization.nextEvents.edges.map((edge) => {
                        return (
                          <EventItem key={edge.node.id} event={edge.node} />
                        );
                      })}
                    </CardText>
                    <CardActions>
                      <Link to="/events">
                        <FlatButton label="Aktivitetskalender" />
                      </Link>
                    </CardActions>
                  </Card>,
                ]
              : null}
            {organization.summaries.length > 0 ? (
              <Paper
                id="information"
                className="item"
                style={{
                  paddingLeft: desktopGutterLess,
                  paddingRight: desktopGutterLess,
                }}
              >
                <h2>
                  <Link to={`/${organization.summaries[0].slug}`}>
                    {organization.summaries[0].title}
                  </Link>
                </h2>
                <Text text={organization.summaries[0].summary} />
                <Link to={`/${organization.summaries[0].slug}`}>Les mer</Link>
              </Paper>
            ) : null}
            {organization.summaries.length > 1 ? (
              <Paper
                className="item"
                style={{
                  paddingLeft: desktopGutterLess,
                  paddingRight: desktopGutterLess,
                }}
              >
                <h2>
                  <Link to={`/${organization.summaries[1].slug}`}>
                    {organization.summaries[1].title}
                  </Link>
                </h2>
                <Text text={organization.summaries[1].summary} />
                <Link to={`/${organization.summaries[1].slug}`}>Les mer</Link>
              </Paper>
            ) : null}
            {organization.summaries.length > 2 ? (
              <Paper
                className="item"
                style={{
                  paddingLeft: desktopGutterLess,
                  paddingRight: desktopGutterLess,
                }}
              >
                <h2>
                  <Link to={`/${organization.summaries[2].slug}`}>
                    {organization.summaries[2].title}
                  </Link>
                </h2>
                <Text text={organization.summaries[2].summary} />
                <Link to={`/${organization.summaries[2].slug}`}>Les mer</Link>
              </Paper>
            ) : null}
            <Paper
              id="contact"
              className="item"
              style={{
                paddingLeft: desktopGutterLess,
                paddingRight: desktopGutterLess,
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
                  marginLeft: -desktopGutterLess,
                  marginRight: -desktopGutterLess,
                }}
              >
                <div
                  style={{
                    flex: "2 1 66%",
                    paddingLeft: desktopGutterLess,
                    paddingRight: desktopGutterLess,
                  }}
                >
                  <iframe
                    title="Map"
                    width="100%"
                    height="300"
                    frameBorder="0"
                    src={organization.mapUrl}
                  />
                </div>
                <div
                  style={{
                    flex: "1 1 33%",
                    paddingLeft: desktopGutterLess,
                    paddingRight: desktopGutterLess,
                  }}
                >
                  <h3>E-post</h3>
                  <a onClick={this.openEmailDialog}>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: organization.encodedEmail,
                      }}
                    />
                  </a>
                  <h3>Øvelser</h3>
                  <Text text={organization.contactText} />
                </div>
              </div>
            </Paper>
          </div>
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(Home, {
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
      nextProject {
        title
        start
        end
        year
        tag
        publicMdtext
        poster {
          filename
          normalPath
        }
        events(first: 100, highlighted: true) {
          edges {
            node {
              id
              highlighted
              location
              start
            }
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
});
