import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "material-ui/Paper";
import Button from "@material-ui/core/Button";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import { RelayProp } from "react-relay";

import AddPageMutation from "../mutations/AddPage";
import theme from "../theme";
import { PermissionArray } from "../types";

import { Pages_organization } from "./__generated__/Pages_organization.graphql";
import { Pages_viewer } from "./__generated__/Pages_viewer.graphql";
import EditPage from "./EditPage";
import PageList from "./PageList";

type Props = {
  organization: Pages_organization,
  relay: RelayProp,
  viewer: Pages_viewer,
};

type State = {
  addPage: boolean,
  menuIsOpen: null | HTMLElement,
  page: {
    id?: string,
    slug: string,
    mdtext: string,
    title: string,
    summary: string,
    permissions: PermissionArray,
  },
};

class Pages extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    addPage: false,
    menuIsOpen: null,
    page: {
      id: undefined,
      slug: "",
      mdtext: "",
      title: "",
      summary: "",
      permissions: [],
    },
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  toggleAddPage = () => {
    this.setState({ addPage: !this.state.addPage });
  };

  closeAddPage = () => {
    this.setState({ addPage: false });
  };

  addPage = (page) => {
    const { relay } = this.props;
    AddPageMutation.commit(relay.environment, page, () => {
      this.closeAddPage();
    });
  };

  render() {
    const org = this.props.organization;
    if (!org.isMember) {
      return <div />;
    }
    return (
      <Paper className="row">
        {this.state.addPage ? (
          <EditPage
            viewer={this.props.viewer}
            savePage={this.addPage}
            {...this.state.page}
          />
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h1>Sider</h1>
              </div>
              <div>
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
                  <MenuItem onClick={this.toggleAddPage}>
                    Legg til side
                  </MenuItem>
                </Menu>
              </div>
            </div>
            <PageList
              pages={org.pages}
              isAdmin={org.isAdmin}
              memberGroupId={org.memberGroup.id}
            />
            {org.pages.pageInfo.hasNextPage ? (
              <Button variant="contained" color="primary">
                Mer
              </Button>
            ) : null}
          </div>
        )}
      </Paper>
    );
  }
}

export default createFragmentContainer(Pages, {
  viewer: graphql`
    fragment Pages_viewer on User {
      groups {
        id
        name
      }
    }
  `,
  organization: graphql`
    fragment Pages_organization on Organization
      @argumentDefinitions(showPages: { type: "Int", defaultValue: 20 }) {
      id
      isMember
      memberGroup {
        id
      }
      isAdmin
      pages(first: $showPages) {
        edges {
          node {
            id
            slug
            mdtext
            title
            summary
            creator {
              name
            }
            created
            updator {
              name
            }
            updated
            permissions {
              public
              groups {
                id
                name
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `,
});
