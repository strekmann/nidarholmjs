import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, createRoutes } from 'react-router';

import App from './components/App';
import Login from './components/Login';
import Home from './components/Home';
import Members from './components/Members';
import Member from './components/Member';
import Projects from './components/Projects';
import Project from './components/Project';
import Event from './components/Event';
import Piece from './components/Piece';
import Files from './components/Files';
import Page from './components/Page';
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
        <Route path="users/:username" component={Member} queries={queries} />
        <Route path="projects" component={Projects} queries={organizationQueries} />
        <Route path="events/:eventid" component={Event} queries={queries} />
        <Route path="music/:pieceId" component={Piece} queries={organizationQueries} />
        <Route path="files" component={Files} queries={queries} />
        <Route path=":slug" component={Page} queries={queries} />
        <Route path=":year/:tag" component={Project} queries={queries} />
        <Route path="*" component={NoMatch} />
    </Route>
);
