import React from 'react';
import Relay from 'react-relay';
import SwipeableViews from 'react-swipeable-views';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import { Link } from 'react-router';
import Text from '../components/Text';
import Date from '../components/Date';

import theme from '../theme';

import ProjectList from '../components/ProjectList';
import EventList from '../components/EventList';

class Home extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        slideIndex: 0,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    changeTab = (value) => {
        this.setState({
            slideIndex: value,
        });
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        const nextProject = org.nextProject;
        if (!viewer) {
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
                                <div style={{ width: nextProject.poster ? '50%' : '75%', minWidth: 270, padding: '0 15px', position: 'relative' }}>
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
                                    <Link to="projects" style={{ position: 'absolute', bottom: 0 }}>
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
                                    <EventList events={org.nextEvents} />
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

        return (
            <section>
                <h1>Hei {viewer.name}</h1>
                <p>Du har logga inn</p>

                <Tabs
                    onChange={this.changeTab}
                    value={this.state.slideIndex}
                >
                    <Tab label="Neste prosjekter" value={0} />
                    <Tab label="Tidligere prosjekter" value={1} />
                </Tabs>
                <SwipeableViews
                    index={this.state.slideIndex}
                    onChangeIndex={this.changeTab}
                >
                    <div>
                        <ProjectList
                            projects={org.nextProjects}
                        />
                        {org.nextProjects.pageInfo.hasNextPage ? <RaisedButton primary onClick={this.loadMoreUpcomongProjects}>Mer</RaisedButton> : null }
                    </div>
                    <div>
                        <ProjectList
                            projects={org.previousProjects}
                        />
                        {org.previousProjects.pageInfo.hasNextPage ? <RaisedButton primary onClick={this.loadMorePreviousProjects}>Mer</RaisedButton> : null }
                    </div>
                </SwipeableViews>
            </section>
        );
    }
}
Home.propTypes = {
    viewer: React.PropTypes.object,
    organization: React.PropTypes.object,
};

Home.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(Home, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
            name
            email
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
                        title
                        start
                        end
                        mdtext
                    }
                }
            }
        }`,
    },
});
