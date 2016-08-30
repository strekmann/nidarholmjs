import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import { match, Router, browserHistory } from 'react-router';
import routes from '../common/routes';
import moment from 'moment';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql', {
    credentials: 'same-origin',
}));
IsomorphicRelay.injectPreparedData(environment, window.__INITIAL_STATE__);

moment.locale('nb');

match({ routes, history: browserHistory }, (error, redirectLocation, renderProps) => {
    IsomorphicRouter.prepareInitialRender(environment, renderProps).then(props => {
        ReactDOM.render(<Router {...props} />, document.getElementById('app'));
    });
});
