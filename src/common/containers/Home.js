import React from 'react';
import Relay from 'react-relay';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import TextField from 'material-ui/TextField';
import { Card, CardMedia } from 'material-ui/Card';
import { Link } from 'react-router';
import Text from '../components/Text';
import Date from '../components/Date';
import EditDescriptionMutation from '../mutations/editDescription';
import EditEventMutation from '../mutations/editEvent';

import theme from '../theme';

import EventList from '../components/EventList';

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
        editDescription: false,
        description_nb: this.props.organization.description_nb,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChangeDescription = (event) => {
        this.setState({ description_nb: event.target.value });
    }

    toggleEditDescription = () => {
        this.setState({ editDescription: !this.state.editDescription });
    }

    saveDescription = () => {
        this.context.relay.commitUpdate(new EditDescriptionMutation({
            viewer: this.props.viewer,
            organization: this.props.organization,
            description_nb: this.state.description_nb,
        }), {
            onSuccess: () => {
                this.setState({
                    editDescription: false,
                });
            },
        });
    }

    saveEvent = (event, closeEdit) => {
        this.context.relay.commitUpdate(new EditEventMutation({
            viewer: this.props.viewer,
            organization: this.props.organization,
            eventid: event.id,
            title: event.title,
            location: event.location,
            start: event.start,
            end: event.end,
            mdtext: event.mdtext,
        }), {
            onSuccess: () => {
                closeEdit();
            },
            onFailure: (error, ost, kake) => {
                console.error("AD", error, ost, kake);
            },
        });
    }

    render() {
        const viewer = this.props.viewer;
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
                        <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: 1000, margin: '0 -15px' }}>
                            <div style={{ width: nextProject.poster ? '50%' : '75%', minWidth: 270, padding: '0 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                    <h2>Kort om korpset</h2>
                    <Text text={org.description_nb} />
                    <RaisedButton onClick={this.toggleEditDescription} label="Rediger" />
                    {this.state.editDescription ?
                        <form>
                            <TextField
                                floatingLabelText="Introduksjonstekst"
                                name="description_nb"
                                value={this.state.description_nb}
                                onChange={this.onChangeDescription}
                                multiLine
                                style={{ width: '100%' }}
                            />
                            <RaisedButton onClick={this.saveDescription} label="Lagre" />
                        </form>
                        :
                        null
                    }
                </section>
                <section>
                    <h2>Kontakt</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', maxWidth: 1000, margin: '0 -15px' }}>
                        <div style={{ width: '50%', minWidth: 270, padding: '0 15px' }}>
                            <Card>
                                <CardMedia>
                                    <iframe width="100%" height="300px" frameBorder="0" src={org.map_url} />
                                </CardMedia>
                            </Card>
                        </div>
                        <div style={{ width: '50%', minWidth: 270, padding: '0 15px' }}>
                            <h3>E-post</h3>
                            <Text text={`<${org.email}>`} />
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
            ${EditDescriptionMutation.getFragment('viewer')},
            ${EditEventMutation.getFragment('viewer')},
        }`,
        organization: () => Relay.QL`
        fragment on Organization {
            id
            name
            email
            description_nb
            map_url
            contact_text
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
