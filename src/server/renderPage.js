import config from 'config';
import ReactDOMServer from 'react-dom/server';
import serialize from 'serialize-javascript';
import 'cookie-parser';
import moment from 'moment';
import Helmet from 'react-helmet';
import injectTapEventPlugin from 'react-tap-event-plugin';

injectTapEventPlugin();

export default function renderPage(element, fetcher, userAgent) {
    const elementRendered = ReactDOMServer.renderToString(element);
    const helmet = Helmet.renderStatic();

    let link = '';
    if (config.get('html.style')) {
        link = helmet.link.toString();
    }
    moment.locale('nb');
    global.navigator = { userAgent };
    return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${link}
    </head>
    <body>
        <div id="app">${elementRendered}</div>
        <script>
            window.__INITIAL_STATE__ = ${serialize(fetcher, { isJSON: true })};
        </script>
        <script src="/javascript.js"></script>
    </body>
    </html>
    `;
}
