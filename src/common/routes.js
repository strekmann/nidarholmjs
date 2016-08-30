import React from 'react';
import Relay from 'react-relay';
import { Route, IndexRoute, createRoutes } from 'react-router';

import App from './containers/App';
import Home from './containers/Home';

export const queries = {
    viewer: () => Relay.QL`query { viewer }`,
};

export default createRoutes(
    <Route path="/" component={App} queries={queries}>
        <IndexRoute component={Home} queries={queries} />
    </Route>
);

