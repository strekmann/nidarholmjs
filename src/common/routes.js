import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, createRoutes } from 'react-router';

import App from './components/App';
import Login from './components/Login';
import Home from './components/Home';
import Members from './components/Members';
import Projects from './components/Projects';
import Project from './components/Project';
import Event from './components/Event';
import About from './components/About';
import NoMatch from './components/NoMatch';

export const queries = {
    viewer: () => Relay.QL`query { viewer }`,
    organization: () => Relay.QL`query { organization }`,
};

export const organizationQueries = {
    organization: () => Relay.QL`query { organization }`,
};

export default createRoutes(
    <Route path="/" component={App} queries={queries}>
        <IndexRoute component={Home} queries={queries} />
        <Route path="login" component={Login} queryies={queries} />
        <Route path="about" component={About} queries={organizationQueries} />
        <Route path="members" component={Members} queries={organizationQueries} />
        <Route path="projects" component={Projects} queries={organizationQueries} />
        <Route path="events/:eventid" component={Event} queries={queries} />
        <Route path=":year/:tag" component={Project} queries={organizationQueries} />
        <Route path="*" component={NoMatch} />
    </Route>
);
