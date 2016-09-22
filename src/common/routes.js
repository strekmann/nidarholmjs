import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, createRoutes } from 'react-router';

import App from './containers/App';
import Home from './containers/Home';
import Projects from './containers/Projects';
import Project from './containers/Project';
import About from './containers/About';

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
        <Route path="about" component={About} queries={organizationQueries} />
        <Route path="projects" component={Projects} queries={organizationQueries} />
        <Route path=":year">
            <Route path=":tag" component={Project} queries={organizationQueries} />
        </Route>
    </Route>
);
