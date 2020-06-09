import config from "config";
import ReactDOMServer from "react-dom/server";
import serialize from "serialize-javascript";
import "cookie-parser";
import Helmet from "react-helmet";

export default function renderPage(element, fetcher, userAgent) {
  const elementRendered = ReactDOMServer.renderToString(element);
  const helmet = Helmet.renderStatic();

  let link = "";
  if (config.get("html.style")) {
    link = helmet.link.toString();
  }

  global.navigator = { userAgent };
  return `
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" sizes="192x192" href="/img/logo.blue.transparent.192.png" />
        <link rel="apple-touch-icon" href="/img/logo.blue.white.192.png">
        <meta name="theme-color" content="#1a237e" />
        ${helmet.title.toString()}
        ${helmet.meta.toString()}
        ${link}
        <style type="text/css">
        .flex-menu-mobile {
          display: none;
        }
        </style>
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
