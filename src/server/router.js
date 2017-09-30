import queryMiddleware from 'farce/lib/queryMiddleware';
import createRender from 'found/lib/createRender';
import makeRouteConfig from 'found/lib/makeRouteConfig';
import Route from 'found/lib/Route';
import { Resolver } from 'found-relay';
import React from 'react';
import { graphql } from 'react-relay';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import App from '../common/components/App';
import Home from '../common/components/Home';

export const historyMiddlewares = [queryMiddleware];

export function createResolver(fetcher) {
    const environment = new Environment({
        network: Network.create((...args) => { return fetcher.fetch(...args); }),
        store: new Store(new RecordSource()),
    });

    return new Resolver(environment);
}

export const routeConfig = makeRouteConfig(
    <Route
        path="/"
        Component={App}
        query={graphql`
            query router_App_Query {
                viewer {
                    ...App_viewer
                }
                organization {
                    ...App_organization
                }
            }
        `}
    >
        <Route
            Component={Home}
            query={graphql`
                query router_Home_Query {
                    viewer {
                        ...Home_viewer
                    }
                    organization {
                        ...Home_organization
                    }
                }
            `}
        />
    </Route>,
);

export const render = createRender({});
