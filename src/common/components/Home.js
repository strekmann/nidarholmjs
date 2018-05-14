/* @flow */
/* eslint "react/no-danger": 0 */

import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Card, CardActions, CardHeader, CardMedia, CardText, CardTitle } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import Link from 'found/lib/Link';

import theme from '../theme';
import SendContactEmailMutation from '../mutations/SendContactEmail';

import ContactForm from './ContactForm';
import Date from './Date';
import EventItem from './EventItem';
import Text from './Text';

type Props = {
    organization: {
        contactText: string,
        encodedEmail: string,
        mapUrl: string,
        name: string,
        nextEvents: {
            edges: Array<{
                node: {
                    id: string,
                },
            }>,
        },
        nextProject: {
            end: any,
            events: {
                edges: Array<{
                    node: {
                        id: string,
                        location: string,
                        start: any,
                        end: any,
                        publicMdtext: string,
                    },
                }>,
            },
            poster: {
                normalPath: string,
            },
            publicMdtext: string,
            tag: string,
            title: string,
            year: string,
        },
        summaries: Array<{
            slug: string,
            summary: string,
            title: string,
        }>,
    },
    relay: {
        environment: {},
    },
}

type State = {
    contactDialogOpen: boolean,
}

class Home extends React.Component<Props, State> {
    muiTheme: {};
    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
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
            <div>
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
                <div
                    style={{
                        maxWidth: 1000,
                        margin: '0 auto',
                    }}
                >
                    {nextProject ?
                        <div
                            style={{
                                display: 'flex',
                                marginLeft: -desktopGutterLess,
                                marginRight: -desktopGutterLess,
                            }}
                        >
                            <Card
                                style={{
                                    flex: '2 1 66%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    marginBottom: desktopGutterLess,
                                    marginLeft: desktopGutterLess,
                                    marginRight: desktopGutterLess,
                                }}
                            >
                                <CardHeader
                                    title={<h2 style={{ margin: 0 }}>Neste prosjekt</h2>}
                                />
                                {nextProject.poster
                                    ? (
                                        <CardMedia
                                            overlay={
                                                <Link
                                                    to={`/${nextProject.year}/${nextProject.tag}`}
                                                >
                                                    <CardTitle
                                                        title={nextProject.title}
                                                        titleStyle={{ color: 'white' }}
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
                                    )
                                    : (
                                        <Link
                                            to={`/${nextProject.year}/${nextProject.tag}`}
                                        >
                                            <CardTitle
                                                title={nextProject.title}
                                            />
                                        </Link>
                                    )
                                }
                                <CardText>
                                    {nextProject.events.edges.map((edge) => {
                                        const event = edge.node;
                                        return (
                                            <div className="meta" key={event.id}>
                                                { event.location } <Date date={event.start} format="LLL" />
                                            </div>
                                        );
                                    })}
                                    {!nextProject.events.edges.length
                                        ? (
                                            <div className="meta" style={{ fontWeight: 'bold' }}>
                                                <Date date={nextProject.end} />
                                            </div>
                                        )
                                        : null
                                    }
                                    <Text text={nextProject.publicMdtext} />
                                </CardText>
                                <CardActions>
                                    <Link to="/projects">
                                        <FlatButton
                                            label="Prosjektoversikt"
                                        />
                                    </Link>
                                </CardActions>
                            </Card>
                            <Card
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    marginLeft: desktopGutterLess,
                                    marginRight: desktopGutterLess,
                                    marginBottom: desktopGutterLess,
                                    flex: '1 1 33%',
                                }}
                            >
                                <CardHeader
                                    title={<h2 style={{ margin: 0 }}>Neste aktiviteter</h2>}
                                />
                                <CardText id="eventList">
                                    {organization.nextEvents.edges.map((edge) => {
                                        return (
                                            <EventItem
                                                key={edge.node.id}
                                                event={edge.node}
                                            />
                                        );
                                    })}
                                </CardText>
                                <CardActions>
                                    <Link to="/events">
                                        <FlatButton label="Aktivitetskalender" />
                                    </Link>
                                </CardActions>
                            </Card>
                        </div>
                        : null
                    }
                    <div
                        style={{
                            display: 'flex',
                            marginLeft: -desktopGutterLess,
                            marginRight: -desktopGutterLess,
                            marginBottom: desktopGutterLess,
                        }}
                    >
                        {organization.summaries.length > 0
                            ? (
                                <Paper
                                    style={{
                                        marginLeft: desktopGutterLess,
                                        marginRight: desktopGutterLess,
                                        paddingLeft: desktopGutterLess,
                                        paddingRight: desktopGutterLess,
                                        width: '100%',
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
                            )
                            : null
                        }
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            marginLeft: -desktopGutterLess,
                            marginRight: -desktopGutterLess,
                        }}
                    >
                        {organization.summaries.length > 1
                            ? (
                                <Paper
                                    style={{
                                        flex: '1 1 50%',
                                        marginLeft: desktopGutterLess,
                                        marginRight: desktopGutterLess,
                                        marginBottom: desktopGutterLess,
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
                            )
                            : null
                        }
                        {organization.summaries.length > 2
                            ? (
                                <Paper
                                    style={{
                                        flex: '1 1 50%',
                                        marginLeft: desktopGutterLess,
                                        marginRight: desktopGutterLess,
                                        marginBottom: desktopGutterLess,
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
                                </Paper>
                            )
                            : null
                        }
                    </div>
                    <Paper
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                        }}
                    >
                        <ContactForm
                            open={this.state.contactDialogOpen}
                            close={this.closeEmailDialog}
                            save={this.sendEmail}
                            organization={this.props.organization}
                        />
                        <h2 style={{ display: 'inline-block' }}>
                            <Link to="/contact">
                                Kontakt
                            </Link>
                        </h2>
                        <div
                            className="small-narrow"
                            style={{
                                display: 'flex',
                                marginLeft: -desktopGutterLess,
                                marginRight: -desktopGutterLess,
                            }}
                        >
                            <div
                                style={{
                                    flex: '2 1 66%',
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
                                    flex: '1 1 33%',
                                    paddingLeft: desktopGutterLess,
                                    paddingRight: desktopGutterLess,
                                }}
                            >
                                <h3>E-post</h3>
                                <a onTouchTap={this.openEmailDialog}>
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
