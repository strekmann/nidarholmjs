import React from 'react';
import Relay from 'react-relay';
import SwipeableViews from 'react-swipeable-views';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Tabs, Tab } from 'material-ui/Tabs';

import theme from '../theme';

import ProjectList from '../components/ProjectList';

const showUpcomingProjects = 4;
const projectsPerPage = 10;

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

    loadMorePreviousProjects = () => {
        const projects = this.props.organization.previousProjects;
        this.props.relay.setVariables({
            showProjects: projects.edges.length + projectsPerPage,
        });
    }

    loadMoreUpcomongProjects = () => {
        const projects = this.props.organization.nextProjects;
        let next = projects.edges.length + projectsPerPage;

        // upcoming list has just a couple of projects, so at first refill,
        // use default page size
        if (projects.edges.length < projectsPerPage) {
            next = projectsPerPage;
        }
        this.props.relay.setVariables({
            showUpcomingProjects: next,
        });
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        if (!viewer) {
            return (
                <section>
                    <h1>Logg inn</h1>
                    <form method="post" action="/auth/login">
                        <div>
                            <TextField floatingLabelText="E-post" id="email" name="email" />
                        </div>
                        <div>
                            <TextField floatingLabelText="Passord" id="password" name="password" type="password" />
                        </div>
                        <div>
                            <RaisedButton type="submit" primary>Logg inn</RaisedButton>
                        </div>
                    </form>
                    <h1>Register</h1>
                    <form method="post" action="/auth/register">
                        <div>
                            <TextField floatingLabelText="Name" id="name" name="name" />
                        </div>
                        <div>
                            <TextField floatingLabelText="Username" id="username" name="username" />
                        </div>
                        <div>
                            <TextField floatingLabelText="E-post" id="email" name="email" />
                        </div>
                        <div>
                            <TextField floatingLabelText="Passord" id="password" name="password" type="password" />
                        </div>
                        <div>
                            <RaisedButton type="submit" primary>Registrer</RaisedButton>
                        </div>
                    </form>
                </section>
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
    initialVariables: {
        showUpcomingProjects,
        showProjects: projectsPerPage,
        projectsPerPage,
    },
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
            nextProjects(first:$showUpcomingProjects) {
                edges {
                    node {
                        id
                        title
                        start
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
            previousProjects(first:$showProjects) {
                edges {
                    node {
                        id
                        title
                        start
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    },
});
