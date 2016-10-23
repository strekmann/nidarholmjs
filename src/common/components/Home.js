import React from 'react';
import Relay from 'react-relay';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';
import { Card, CardMedia } from 'material-ui/Card';
import { Link } from 'react-router';
import Text from './Text';
import Date from './Date';
import Email from './Email';

import theme from '../theme';

import EventList from './EventList';

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

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        const org = this.props.organization;
        const nextProject = org.nextProject;
        return (
            <main>
                <div
                    style={{
                        backgroundImage: 'url(/img/Musikkforeningen-Nidarholm-dir-Trond-Madsen-1.jpg)',
                        backgroundPosition: 'top center',
                        backgroundSize: 'cover',
                        height: '30vw',
                        width: '100%',
                    }}
                >
                    <h1
                        className="giant-image-text"
                        style={{
                            marginTop: 0,
                            paddingTop: '3vw',
                            textAlign: 'center',
                            color: 'rgba(255,255,255,0.6)',
                        }}
                    >
                        {org.name}
                    </h1>
                </div>
                {nextProject ?
                    <section>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                maxWidth: 1000,
                                margin: '0 -15px',
                            }}
                        >
                            <div
                                style={{
                                    width: nextProject.poster ? '50%' : '75%',
                                    minWidth: 270,
                                    padding: '0 15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <h2>Neste konsert</h2>
                                <span
                                    style={{
                                        fontSize: '3rem',
                                    }}
                                >
                                    {nextProject.title}
                                </span>
                                <div className="meta" style={{ fontWeight: 'bold' }}>
                                    <Date date={nextProject.end} />
                                </div>
                                <Text text={nextProject.public_mdtext} />
                                <Link to="projects" style={{ alignSelf: 'end' }}>
                                    Alle konserter
                                </Link>
                            </div>
                            {nextProject.poster ?
                                <div style={{ width: '25%', minWidth: 270, padding: '0 15px' }}>
                                    <Card>
                                        <CardMedia>
                                            <img
                                                alt="Konsertplakat"
                                                src={nextProject.poster.normal_path}
                                            />
                                        </CardMedia>
                                    </Card>
                                </div>
                            : null }
                            <div style={{ width: '25%', minWidth: 230, padding: '0 15px' }}>
                                <h2>Neste aktiviteter</h2>
                                <EventList events={org.nextEvents} saveEvent={this.saveEvent} />
                                <Link to="projects">
                                    Aktivitetskalender
                                </Link>
                            </div>
                        </div>
                    </section>
                    : null
                }
                <section>
                    {org.summaries.length > 0 ?
                        <div>
                            <h2><Link to={`/${org.summaries[0].slug}`}>{org.summaries[0].title}</Link></h2>
                            <Text text={org.summaries[0].summary} />
                            <Link to={`/${org.summaries[0].slug}`}>Les mer</Link>
                        </div>
                    : null }
                </section>
                <div style={{ display: 'flex', maxWidth: 1000, margin: '0 auto' }}>
                    {org.summaries.length > 1 ?
                        <div style={{ padding: '0 15px', flexGrow: 1 }}>
                            <h2><Link to={`/${org.summaries[1].slug}`}>{org.summaries[1].title}</Link></h2>
                            <Text text={org.summaries[1].summary} />
                            <Link to={`/${org.summaries[1].slug}`}>Les mer</Link>
                        </div>
                    : null }
                    {org.summaries.length > 2 ?
                        <div style={{ padding: '0 15px', flexGrow: 1 }}>
                            <h2><Link to={`/${org.summaries[2].slug}`}>{org.summaries[2].title}</Link></h2>
                            <Text text={org.summaries[2].summary} />
                            <Link to={`/${org.summaries[2].slug}`}>Les mer</Link>
                        </div>
                    : null }
                </div>
                <section>
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
                            <Card>
                                <CardMedia>
                                    <iframe
                                        width="100%"
                                        height="300px"
                                        frameBorder="0"
                                        src={org.map_url}
                                    />
                                </CardMedia>
                            </Card>
                        </div>
                        <div style={{ width: '50%', minWidth: 270, padding: '0 15px' }}>
                            <h3>E-post</h3>
                            <Email email={org.email} />
                            <h3>Øvelser</h3>
                            <Text text={org.contact_text} />
                        </div>
                    </div>
                </section>
            </main>
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
            email
            map_url
            contact_text
            summaries {
                title
                summary
                slug
            }
            nextProject {
                title
                start
                end
                poster {
                    filename
                    normal_path
                }
            }
            nextEvents(first:4) {
                edges {
                    node {
                        id
                        title
                        location
                        start
                        end
                        tags
                        mdtext
                    }
                }
            }
        }`,
    },
});
