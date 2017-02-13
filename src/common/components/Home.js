import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Paper from 'material-ui/Paper';
import { Link } from 'react-router';
import Text from './Text';
import Date from './Date';
import ContactForm from './ContactForm';
import EventItem from './EventItem';

import theme from '../theme';
import SendContactEmailMutation from '../mutations/sendContactEmail';


class Home extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
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
        this.context.relay.commitUpdate(new SendContactEmailMutation({
            email: form.email,
            name: form.name,
            text: form.text,
            organization: this.props.organization,
        }));
    }

    openEmailDialog = () => {
        this.setState({ contactDialogOpen: true });
    }

    closeEmailDialog = () => {
        this.setState({ contactDialogOpen: false });
    }

    render() {
        const org = this.props.organization;
        const nextProject = org.nextProject;
        return (
            <Paper
                className="home"
                style={{ maxWidth: 1000, margin: '0 auto', padding: '0 20px 2em' }}
            >
                <div
                    style={{
                        backgroundImage:
                            'url(/img/Musikkforeningen-Nidarholm-dir-Trond-Madsen-1.jpg)',
                        backgroundPosition: 'top center',
                        backgroundSize: 'cover',
                        height: '30vw',
                        margin: '0 -20px',
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
                        {org.name}
                    </h1>
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            paddingRight: 15,
                            paddingLeft: 15,
                            color: theme.palette.accent3Color,
                        }}
                    >
                        Foto: Vilde Marie Steen Angell
                    </div>
                </div>
                {nextProject ?
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                maxWidth: 1000,
                                margin: '0 -20px',
                            }}
                        >
                            <div
                                style={{
                                    width: '70%',
                                    minWidth: 260,
                                    padding: '0 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <h2>Neste konsert</h2>
                                {nextProject.poster ?
                                        <Link
                                            to={`/${nextProject.year}/${nextProject.tag}`}
                                        >
                                            <img
                                                alt="Konsertplakat"
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
                                <div className="meta" style={{ fontWeight: 'bold' }}>
                                    <Date date={nextProject.end} />
                                </div>
                                <div>
                                    <Text text={nextProject.publicMdtext} />
                                </div>
                                <div>
                                    <Link to="projects">
                                        Konsertoversikt
                                    </Link>
                                </div>
                            </div>
                            <div style={{ width: '30%', minWidth: 230, padding: '0 20px' }}>
                                <h2>Neste aktiviteter</h2>
                                <div id="eventList">
                                    {org.nextEvents.edges.map(edge => (
                                        <EventItem
                                            key={edge.node.id}
                                            event={edge.node}
                                        />
                                    ))}
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
                    {org.summaries.length > 0 ?
                        <div>
                            <h2>
                                <Link to={`/${org.summaries[0].slug}`}>
                                    {org.summaries[0].title}
                                </Link>
                            </h2>
                            <Text text={org.summaries[0].summary} />
                            <Link to={`/${org.summaries[0].slug}`}>Les mer</Link>
                        </div>
                    : null }
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -20px' }}>
                    {org.summaries.length > 1 ?
                        <div style={{ padding: '0 20px', width: '50%', minWidth: 260 }}>
                            <h2>
                                <Link to={`/${org.summaries[1].slug}`}>
                                    {org.summaries[1].title}
                                </Link>
                            </h2>
                            <Text text={org.summaries[1].summary} />
                            <Link to={`/${org.summaries[1].slug}`}>Les mer</Link>
                        </div>
                    : null }
                    {org.summaries.length > 2 ?
                        <div style={{ padding: '0 20px', width: '50%', minWidth: 260 }}>
                            <h2>
                                <Link to={`/${org.summaries[2].slug}`}>
                                    {org.summaries[2].title}
                                </Link>
                            </h2>
                            <Text text={org.summaries[2].summary} />
                            <Link to={`/${org.summaries[2].slug}`}>Les mer</Link>
                        </div>
                    : null }
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
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            maxWidth: 1000,
                            margin: '0 -15px',
                        }}
                    >
                        <div style={{ width: '50%', minWidth: 270, padding: '0 15px' }}>
                            <Paper>
                                <iframe
                                    width="100%"
                                    height="300px"
                                    frameBorder="0"
                                    src={org.mapUrl}
                                />
                            </Paper>
                        </div>
                        <div style={{ width: '50%', minWidth: 270, padding: '0 15px' }}>
                            <h3>E-post</h3>
                            <a onTouchTap={this.openEmailDialog}>
                                <span dangerouslySetInnerHTML={{ __html: org.encodedEmail }} />
                            </a>
                            <h3>Øvelser</h3>
                            <Text text={org.contactText} />
                        </div>
                    </div>
                </div>
            </Paper>
        );
    }
}

export default Relay.createContainer(Home, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
            name
            email
            username
        }`,
        organization: () => Relay.QL`
        fragment on Organization {
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
            }
            nextEvents(first:4) {
                edges {
                    node {
                        id
                        ${EventItem.getFragment('event')}
                    }
                }
            }
            ${ContactForm.getFragment('organization')}
            ${SendContactEmailMutation.getFragment('organization')}
        }`,
    },
});
