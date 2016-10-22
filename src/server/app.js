import ReactDOMServer from 'react-dom/server';
import Router from 'isomorphic-relay-router';
import RelayLocalSchema from 'relay-local-schema';
import 'cookie-parser';
import config from 'config';
import moment from 'moment';
// import Helmet from 'react-helmet';
import { match } from 'react-router';
import routes from '../common/routes';
// import headconfig from '../common/components/Meta';
import schema from './schema';

function renderFullPage(renderedContent, initialState, head = {
    title: '<title>Nidarholm</title>',
    meta: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    link: '<link rel="stylesheet" href="/styles.css"/>',
}) {
    let link = '';
    if (config.get('html.style')) {
        link = head.link;
    }
    return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        ${head.title}
        ${head.meta}
        ${link}
    </head>
    <body>
        <div id="app">${renderedContent}</div>
        <script>
            window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
        </script>
        <script src="/javascript.js"></script>
    </body>
    </html>
    `;
}

export default function render(req, res, next) {
    match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
        if (err) {
            return next(err);
            // res.status(500).send(err.message);
        }
        else if (redirectLocation) {
            return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        }
        else if (renderProps) {
            moment.locale('nb');

            const contextValue = {};
            contextValue.organization = req.organization;

            if (req.user) {
                contextValue.viewer = req.user;
            }
            const networkLayer = new RelayLocalSchema.NetworkLayer({
                schema,
                contextValue, // the same values in root and context for now
                rootValue: contextValue, // context should be an authentication token or similar
                onError: (errors, request) => next(new Error(errors)),
            });
            return Router.prepareData(renderProps, networkLayer).then(({ data, props }) => {
                try {
                    global.navigator = { userAgent: req.headers['user-agent'] };
                    const renderedContent = ReactDOMServer.renderToString(Router.render(props));
                    // const helmet = Helmet.rewind();

                    const renderedPage = renderFullPage(renderedContent, data);
                    return res.send(renderedPage);
                }
                catch (err) {
                    return next(err);
                }
            }, next);
        }
        return next();
    });
}
