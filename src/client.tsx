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
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

  const isMapContainerPresent = document.getElementById("map");
  if (isMapContainerPresent != null) {
    const map = L.map("map").setView([63.43, 10.41], 14);

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1Ijoic2lndXJkZ2EiLCJhIjoiWU1Ub1dLcyJ9.tgg0nUtFrh7IR7hDH3ZWKA",
      },
    ).addTo(map);

    const defaultIcon = L.icon({
      iconUrl: `${markerIcon}`,
      shadowUrl: `${markerShadow}`,
      iconSize: [24, 36],
      iconAnchor: [12, 36],
    });

    L.Marker.prototype.options.icon = defaultIcon;

    const marker = L.marker([63.4296, 10.4177]).addTo(map);
    marker.bindPopup("Rosenborg skole");
  }
})();
