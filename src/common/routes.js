import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, createRoutes } from 'react-router';

import App from './components/App';
import Login from './components/Login';
import Home from './components/Home';
import Members from './components/Members';
import Member from './components/Member';
import MemberReset from './components/MemberReset';
import Organization from './components/Organization';
import Projects from './components/Projects';
import Project from './components/Project';
import Event from './components/Event';
import Events from './components/Events';
import Piece from './components/Piece';
import Pieces from './components/Pieces';
import Files from './components/Files';
import Page from './components/Page';
import Pages from './components/Pages';
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
        <Route path="members" component={Members} queries={organizationQueries} />
        <Route path="users/:id">
            <IndexRoute component={Member} queries={queries} />
            <Route path="reset" component={MemberReset} queries={queries} />
        </Route>
        <Route path="projects" component={Projects} queries={queries} />
        <Route path="events/:eventid" component={Event} queries={queries} />
        <Route path="events" component={Events} queries={organizationQueries} />
        <Route path="music/:pieceId" component={Piece} queries={organizationQueries} />
        <Route path="music" component={Pieces} queries={organizationQueries} />
        <Route path="files" component={Files} queries={queries} />
        <Route path="org" component={Organization} queries={organizationQueries} />
        <Route path="pages" component={Pages} queries={queries} />
        <Route path=":slug" component={Page} queries={queries} />
        <Route path=":year/:tag" component={Project} queries={queries} />
        <Route path="*" component={NoMatch} />
    </Route>
);
