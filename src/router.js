import queryMiddleware from 'farce/lib/queryMiddleware';
import createRender from 'found/lib/createRender';
import makeRouteConfig from 'found/lib/makeRouteConfig';
import Route from 'found/lib/Route';
import { Resolver } from 'found-relay';
import React from 'react';
import { graphql } from 'react-relay';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import App from './common/components/App';
import Home from './common/components/Home';
import Login from './common/components/Login';
import Files from './common/components/Files';
import Page from './common/components/Page';
import Pages from './common/components/Pages';
import Projects from './common/components/Projects';

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
        <Route
            path="login"
            Component={Login}
        />
        <Route
            path="files"
            Component={Files}
            query={graphql`
                query router_Files_Query {
                    viewer {
                        ...Files_viewer
                    }
                    organization {
                        ...Files_organization
                    }
                }
            `}
        />
        <Route
            path="projects"
            Component={Projects}
            query={graphql`
                query router_Projects_Query {
                    viewer {
                        ...Projects_viewer
                    }
                    organization {
                        ...Projects_organization
                    }
                }
            `}
        />
        <Route
            path="pages"
            Component={Pages}
            query={graphql`
                query router_Pages_Query {
                    viewer {
                        ...Pages_viewer
                    }
                    organization {
                        ...Pages_organization
                    }
                }
            `}
        />
        <Route
            path=":slug"
            Component={Page}
            variables={{ slug: null }}
            query={graphql`
                query router_Page_Query($slug: String) {
                    viewer {
                        ...Page_viewer
                    }
                    organization {
                        ...Page_organization
                    }
                }
            `}
        />
    </Route>,
);

export const render = createRender({});
