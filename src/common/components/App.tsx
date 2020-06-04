import blue from "@material-ui/core/colors/blue";
import indigo from "@material-ui/core/colors/indigo";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import React from "react";
import Helmet from "react-helmet";
import { createFragmentContainer, graphql } from "react-relay";
import Footer from "./Footer";
import Navigation from "./Navigation";
import { App_organization } from "./__generated__/App_organization.graphql";
import { App_viewer } from "./__generated__/App_viewer.graphql";

type Props = {
  viewer: App_viewer,
  organization: App_organization,
  children: React.ReactNode,
};

function App(props: Props) {
  const { children, organization, viewer } = props;
  const imageUrl = `${organization.baseurl}/img/musikkforeningen-nidarholm.jpg`;
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          primary: indigo,
          secondary: blue,
          type: "light", // TODO: Not ready: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <Helmet
        titleTemplate="%s – Nidarholm"
        defaultTitle="Nidarholm"
        meta={[
          {
            name: "viewport",
            content: "width=device-width, initial-scale=1",
          },
          { name: "author", content: "Musikkforeningen Nidarholm" },
          { name: "description", content: organization.description_nb || "" },
          { property: "og:site_name", content: "Nidarholm" },
          { property: "og:url", content: organization.baseurl || "" },
          { property: "og:title", content: "Nidarholm" },
          { property: "og:image", content: imageUrl || "" },
          {
            property: "og:description",
            content: organization.description_nb || "",
          },
          { property: "fb:app_id", content: organization.facebookAppid || "" },
        ]}
      />
      <Navigation viewer={viewer} organization={organization} />
      {children}
      <Footer organization={organization} />
    </ThemeProvider>
  );
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
