import "cookie-parser";
import { ReactComponentElement } from "react";
import ReactDOMServer from "react-dom/server";
import Helmet from "react-helmet";
import serialize from "serialize-javascript";

import config from "../config";
import { ServerFetcher } from "../fetcher";

export default function renderPage(
  element: ReactComponentElement<any>,
  fetcher: ServerFetcher,
) {
  const elementRendered = ReactDOMServer.renderToString(element);
  const helmet = Helmet.renderStatic();

  const link = config.html.style ? helmet.link.toString() : "";

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
        nav a {
          color: white;
          margin-left: 20px;
        }
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
