/* global window, document, navigator */
// @ts-nocheck
import "@babel/polyfill";
import BrowserProtocol from "farce/BrowserProtocol";
import createInitialFarceRouter from "found/createInitialFarceRouter";
import runtime from "serviceworker-webpack-plugin/lib/runtime";
import React from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import "moment/locale/nb";
import "./static/scss/styles.scss";
import "mapbox-gl/dist/mapbox-gl.css";

import { ClientFetcher } from "./fetcher";
import {
  createResolver,
  historyMiddlewares,
  render,
  routeConfig,
} from "./router";

moment.locale("nb");

if ("serviceWorker" in navigator) {
  runtime
    .register()
    .then((reg) => {
      // registration OK
      // eslint-disable-next-line no-console
      console.debug("Registration OK. Scope is:", reg.scope);
    })
    .catch((error) => {
      // registration failed
      // eslint-disable-next-line no-console
      console.error("Registration failed with error:", error);
    });
}

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
