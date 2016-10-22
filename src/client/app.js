import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import { match, Router, browserHistory } from 'react-router';
import routes from '../common/routes';
import injectTapEventPlugin from 'react-tap-event-plugin';
import moment from 'moment';
import 'moment/locale/nb';
import 'font-awesome/css/font-awesome.css';
import '../static/scss/styles.scss';

injectTapEventPlugin();

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql', {
    credentials: 'same-origin',
}));
IsomorphicRelay.injectPreparedData(environment, window.__INITIAL_STATE__);

match({ routes, history: browserHistory }, (error, redirectLocation, renderProps) => {
    IsomorphicRouter.prepareInitialRender(environment, renderProps).then(props => {
        ReactDOM.render(<Router {...props} />, document.getElementById('app'));
    });
});
