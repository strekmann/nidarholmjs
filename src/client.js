/* global window, document */

import "babel-polyfill";
import BrowserProtocol from "farce/lib/BrowserProtocol";
import createInitialFarceRouter from "found/lib/createInitialFarceRouter";
import React from "react";
import ReactDOM from "react-dom";
import injectTapEventPlugin from "react-tap-event-plugin";
import moment from "moment";
import "moment/locale/nb";
import "font-awesome/css/font-awesome.css";
import "./static/scss/styles.scss";

import { ClientFetcher } from "./fetcher";
import {
  createResolver,
  historyMiddlewares,
  render,
  routeConfig,
} from "./router";

moment.locale("nb");
injectTapEventPlugin();

(async () => {
  const fetcher = new ClientFetcher("/graphql", window.__INITIAL_STATE__);
  const resolver = createResolver(fetcher);
  const Router = await createInitialFarceRouter({
    historyProtocol: new BrowserProtocol(),
    historyMiddlewares,
    routeConfig,
    resolver,
    render,
  });

  ReactDOM.hydrate(
    <Router resolver={resolver} />,
    document.getElementById("app"),
  );
})();
