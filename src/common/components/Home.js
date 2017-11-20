/* eslint "react/no-danger": 0 */

import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import Link from 'found/lib/Link';

import theme from '../theme';
import SendContactEmailMutation from '../mutations/SendContactEmail';

import ContactForm from './ContactForm';
import Date from './Date';
import EventItem from './EventItem';
import Text from './Text';

class Home extends React.Component {
    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    static propTypes = {
        organization: PropTypes.object.isRequired,
        relay: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        contactDialogOpen: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    sendEmail = (form) => {
        this.setState({ sent: true });
        const { organization, relay } = this.props;
        SendContactEmailMutation.commit(relay.environment, organization, form);
    }

    openEmailDialog = () => {
        this.setState({ contactDialogOpen: true });
    }

    closeEmailDialog = () => {
        this.setState({ contactDialogOpen: false });
    }

    render() {
        const { organization } = this.props;
        const { nextProject } = organization;
        const { desktopGutterLess } = theme.spacing;
        return (
            <Paper
                className="home"
                style={{
                    maxWidth: 1000,
                    margin: '0 auto',
                    paddingTop: 0,
                    paddingBottom: desktopGutterLess,
                    paddingLeft: desktopGutterLess,
                    paddingRight: desktopGutterLess,
                }}
            >
                <div
                    style={{
                        backgroundImage:
                            'url(/img/Musikkforeningen-Nidarholm-dir-Trond-Madsen-1.jpg)',
                        backgroundPosition: 'top center',
                        backgroundSize: 'cover',
                        height: '30vw',
                        marginLeft: -desktopGutterLess,
                        marginRight: -desktopGutterLess,
                        position: 'relative',
                    }}
                >
                    <h1
                        className="giant-image-text"
                        style={{
                            marginTop: 0,
                            paddingTop: '3vw',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.6)',
                            display: 'none',
                        }}
                    >
                        {organization.name}
                    </h1>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            paddingRight: desktopGutterLess,
                            paddingLeft: desktopGutterLess,
                            color: theme.palette.accent3Color,
                        }}
                    >
                        Foto: Vilde Marie Steen Angell
                    </div>
                </div>
                {nextProject ?
                    <div>
                        <div
                            className="small-narrow"
                            style={{
                                display: 'flex',
                                maxWidth: 1000,
                                marginLeft: -desktopGutterLess,
                                marginRight: -desktopGutterLess,
                            }}
                        >
                            <div
                                style={{
                                    paddingLeft: desktopGutterLess,
                                    paddingRight: desktopGutterLess,
                                    flex: '3 1 75%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <h2>Neste prosjekt</h2>
                                {nextProject.poster ?
                                    <Link
                                        to={`/${nextProject.year}/${nextProject.tag}`}
                                    >
                                        <img
                                            alt="Prosjektplakat"
                                            src={nextProject.poster.normalPath}
                                            className="responsive"
                                        />
                                    </Link>
                                    : null
                                }
                                <Link
                                    to={`/${nextProject.year}/${nextProject.tag}`}
                                    style={{
                                        fontSize: '3rem',
                                        paddingTop: '1.5rem',
                                        paddingBottom: '1.5rem',
                                    }}
                                >
                                    {nextProject.title}
                                </Link>
                                {nextProject.events.edges.map((edge) => {
                                    const event = edge.node;
                                    return (
                                        <div className="meta" key={event.id}>
                                            { event.location } <Date date={event.start} format="LLL" />
                                        </div>
                                    );
                                })}
                                {!nextProject.events.edges.length
                                    ? <div className="meta" style={{ fontWeight: 'bold' }}>
                                        <Date date={nextProject.end} />
                                    </div>
                                    : null
                                }
                                <div>
                                    <Text text={nextProject.publicMdtext} />
                                </div>
                                <div>
                                    <Link to="projects">
                                        Prosjektoversikt
                                    </Link>
                                </div>
                            </div>
                            <div
                                style={{
                                    paddingLeft: desktopGutterLess,
                                    paddingRight: desktopGutterLess,
                                    flex: '1 1 25%',
                                }}
                            >
                                <h2>Neste aktiviteter</h2>
                                <div id="eventList">
                                    {organization.nextEvents.edges.map((edge) => {
                                        return (
                                            <EventItem
                                                key={edge.node.id}
                                                event={edge.node}
                                            />
                                        );
                                    })}
                                </div>
                                <div>
                                    <Link to="events">
                                        Aktivitetskalender
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    : null
                }
                <div>
                    {organization.summaries.length > 0
                        ? <div>
                            <h2>
                                <Link to={`/${organization.summaries[0].slug}`}>
                                    {organization.summaries[0].title}
                                </Link>
                            </h2>
                            <Text text={organization.summaries[0].summary} />
                            <Link to={`/${organization.summaries[0].slug}`}>Les mer</Link>
                        </div>
                        : null
                    }
                </div>
                <div
                    className="small-narrow"
                    style={{
                        display: 'flex',
                        marginLeft: -desktopGutterLess,
                        marginRight: -desktopGutterLess,
                    }}
                >
                    {organization.summaries.length > 1
                        ? <div
                            style={{
                                flex: '1 1 50%',
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
                        </div>
                        : null
                    }
                    {organization.summaries.length > 2
                        ? <div
                            style={{
                                flex: '1 1 50%',
                                paddingLeft: desktopGutterLess,
                                paddingRight: desktopGutterLess,
                                minWidth: 0,
                            }}
                        >
                            <h2>
                                <Link to={`/${organization.summaries[2].slug}`}>
                                    {organization.summaries[2].title}
                                </Link>
                            </h2>
                            <Text text={organization.summaries[2].summary} />
                            <Link to={`/${organization.summaries[2].slug}`}>Les mer</Link>
                        </div>
                        : null
                    }
                </div>
                <div>
                    <ContactForm
                        open={this.state.contactDialogOpen}
                        close={this.closeEmailDialog}
                        save={this.sendEmail}
                        organization={this.props.organization}
                    />
                    <h2>Kontakt</h2>
                    <div
                        className="small-narrow"
                        style={{
                            display: 'flex',
                            maxWidth: 1000,
                            marginLeft: -desktopGutterLess,
                            marginRight: -desktopGutterLess,
                        }}
                    >
                        <div
                            style={{
                                flex: '1 1 66%',
                                paddingLeft: desktopGutterLess,
                                paddingRight: desktopGutterLess,
                            }}
                        >
                            <Paper>
                                <iframe
                                    title="Map"
                                    width="100%"
                                    height="300"
                                    frameBorder="0"
                                    src={organization.mapUrl}
                                />
                            </Paper>
                        </div>
                        <div
                            style={{
                                flex: '1 1 33%',
                                paddingLeft: desktopGutterLess,
                                paddingRight: desktopGutterLess,
                            }}
                        >
                            <h3>E-post</h3>
                            <a onTouchTap={this.openEmailDialog}>
                                <span
                                    dangerouslySetInnerHTML={{ __html: organization.encodedEmail }}
                                />
                            </a>
                            <h3>Øvelser</h3>
                            <Text text={organization.contactText} />
                        </div>
                    </div>
                </div>
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Home,
    {
        viewer: graphql`
        fragment Home_viewer on User {
            id
            name
            email
            username
        }`,
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
                events(first:100,highlighted:true) {
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
            nextEvents(first:4) {
                edges {
                    node {
                        id
                        ...EventItem_event
                    }
                }
            }
            ...ContactForm_organization
        }`,
    },
);
