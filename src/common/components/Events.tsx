import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Toolbar from "@material-ui/core/Toolbar";
import Link from "found/Link";
import ActionHelp from "@material-ui/icons/Help";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay";
import EventItem from "./EventItem";
import { Events_organization } from "./__generated__/Events_organization.graphql";

const ITEMS_PER_PAGE = 20;

type Props = {
  organization: Events_organization,
  relay: RelayRefetchProp,
};

type State = {
  menuIsOpen: null | HTMLElement,
};

class Events extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      menuIsOpen: null,
    };
  }

  loadMoreEvents = () => {
    const { relay } = this.props;
    relay.refetch((variables) => {
      return {
        showItems: variables.showItems + ITEMS_PER_PAGE,
      };
    });
  };

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  render() {
    const { organization } = this.props;
    const { events, isAdmin } = organization;
    return (
      <div className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>Aktiviteter</h1>
          <Toolbar>
            <div>
              <Button
                variant="text"
                href={`webcal://${organization.webdomain}/events/public.ics`}
              >
                Abonner på kalender
              </Button>
              <IconButton href="/hjelp-om-aktiviteter">
                <ActionHelp />
              </IconButton>

              {isAdmin ? (
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
                    <MenuItem component={Link} to="/events/responsibilities">
                      Aktiviteter og ansvar
                    </MenuItem>
                  </Menu>
                </div>
              ) : null}
            </div>
          </Toolbar>
        </div>
        <div>
          {events.edges.map((edge) => {
            return <EventItem key={edge.node.id} event={edge.node} />;
          })}
        </div>
        {events.pageInfo.hasNextPage ? (
          <Button
            variant="contained"
            color="primary"
            onClick={this.loadMoreEvents}
          >
            Mer
          </Button>
        ) : null}
      </div>
    );
  }
}

export default createRefetchContainer(
  Events,
  {
    organization: graphql`
      fragment Events_organization on Organization
        @argumentDefinitions(showItems: { type: "Int", defaultValue: 20 }) {
        id
        memberGroup {
          id
        }
        isAdmin
        webdomain
        events(first: $showItems) {
          edges {
            node {
              id
              ...EventItem_event
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `,
  },
  graphql`
    query EventsRefetchQuery($showItems: Int) {
      organization {
        ...Events_organization @arguments(showItems: $showItems)
      }
    }
  `,
);
