import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import EditPageMutation from "../mutations/EditPage";
import { PermissionArray } from "../types";
import { flattenPermissions } from "../utils";
import EditPage from "./EditPage";
import Text from "./Text";
import { Page_organization } from "./__generated__/Page_organization.graphql";
import { Page_viewer } from "./__generated__/Page_viewer.graphql";

type Props = {
  viewer: Page_viewer,
  organization: Page_organization,
  location: {
    pathname: string,
  },
  relay: RelayProp,
};

type State = {
  edit: boolean,
  menuIsOpen: null | HTMLElement,
  permissions: PermissionArray,
};

class Page extends React.Component<Props, State> {
  state = {
    edit: false,
    menuIsOpen: null,
    permissions:
      this.props.organization.page && this.props.organization.page.permissions
        ? flattenPermissions(this.props.organization.page.permissions)
        : [],
  };

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  toggleEdit = () => {
    this.setState({
      edit: !this.state.edit,
    });
  };

  closeEdit = () => {
    this.setState({
      edit: false,
    });
  };

  savePage = (page) => {
    const { relay } = this.props;
    EditPageMutation.commit(relay.environment, page, () => {
      this.closeEdit();
    });
  };

  render() {
    const { location, organization } = this.props;
    const { isMember } = organization;
    if (!organization.page || !organization.page.slug) {
      return (
        <Paper className="row">
          <h1>Ikke funnet: {location.pathname}</h1>
          <p>Denne sida fins ikke</p>
        </Paper>
      );
    }
    if (this.state.edit) {
      const { page: pageProps } = organization;
      const page = {
        id: pageProps.id,
        mdtext: pageProps.mdtext,
        slug: pageProps.slug,
        summary: pageProps.summary,
        title: pageProps.title,
        permissions: this.state.permissions,
      };
      // page.permissions = this.state.permissions;
      return (
        <EditPage
          viewer={this.props.viewer}
          savePage={this.savePage}
          {...page}
        />
      );
    }
    return (
      <Paper className="row">
        {isMember ? (
          <div style={{ float: "right" }}>
            <IconButton onClick={this.onMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={this.state.menuIsOpen}
              onClose={this.onMenuClose}
              open={Boolean(this.state.menuIsOpen)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={this.toggleEdit}>Rediger</MenuItem>
            </Menu>
          </div>
        ) : null}
        <Text text={organization.page.mdtext} />
      </Paper>
    );
  }
}

export default createFragmentContainer(Page, {
  organization: graphql`
    fragment Page_organization on Organization {
      isMember
      memberGroup {
        id
      }
      page(slug: $slug) {
        id
        slug
        title
        summary
        mdtext
        permissions {
          public
          groups {
            id
            name
          }
          users {
            id
            name
          }
        }
        created
        updated
        updator {
          name
        }
      }
    }
  `,
  viewer: graphql`
    fragment Page_viewer on User {
      id
      groups {
        id
        name
      }
    }
  `,
});
