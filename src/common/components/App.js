// @flow

import * as React from "react";
import Helmet from "react-helmet";
import { createFragmentContainer, graphql } from "react-relay";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";

import theme from "../theme";

import Footer from "./Footer";
import Navigation from "./Navigation";
import type AppOrganization from "./__generated__/App_organization.graphql";
import type AppViewer from "./__generated__/App_viewer.graphql";

type Props = {
  viewer: AppViewer,
  organization: AppOrganization,
  children: React.Node,
};

class App extends React.Component<Props> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

  render() {
    const { organization } = this.props;
    const imageUrl = `${
      organization.baseurl
    }/img/Musikkforeningen-Nidarholm-dir-Trond-Madsen-1.
jpg`;
    return (
      <div>
        <Helmet
          titleTemplate="%s – Nidarholm"
          defaultTitle="Nidarholm"
          meta={[
            {
              name: "viewport",
              content: "width=device-width, initial-scale=1",
            },
            { name: "author", content: "Musikkforeningen Nidarholm" },
            { name: "description", content: organization.description_nb },
            { property: "og:site_name", content: "Nidarholm" },
            { property: "og:url", content: organization.baseurl },
            { property: "og:title", content: "Nidarholm" },
            { property: "og:image", content: imageUrl },
            {
              property: "og:description",
              content: organization.description_nb,
            },
            { property: "fb:app_id", content: organization.facebookAppid },
          ]}
        />
        <Navigation viewer={this.props.viewer} organization={organization} />
        {this.props.children}
        <Footer viewer={this.props.viewer} organization={organization} />
      </div>
    );
  }
}

export default createFragmentContainer(App, {
  viewer: graphql`
    fragment App_viewer on User {
      ...Navigation_viewer
    }
  `,
  organization: graphql`
    fragment App_organization on Organization {
      baseurl
      facebookAppid
      description_nb
      ...Navigation_organization
      ...BottomNavigation_organization
      ...Footer_organization
    }
  `,
});
