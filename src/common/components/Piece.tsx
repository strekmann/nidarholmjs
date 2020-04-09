import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "material-ui/Paper";
import Toggle from "material-ui/Toggle";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";
import UpdatePieceMutation from "../mutations/UpdatePiece";

import TextList from "./List";
import GroupscoreList from "./GroupscoreList";
import GroupscoreUpload from "./GroupscoreUpload";
import PieceForm from "./PieceForm";
import { Piece_organization } from "./__generated__/Piece_organization.graphql";
import { Piece_viewer } from "./__generated__/Piece_viewer.graphql";

type Props = {
  organization: Piece_organization,
  viewer: Piece_viewer,
  relay: {
    environment: {},
  },
  router: any /* {
    push: ({
      pathname?: string,
    }) => void,
  }*/,
};

type State = {
  editPiece: boolean,
  menuIsOpen: null | HTMLElement,
  showAdmin: boolean,
};

class Piece extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    editPiece: false,
    menuIsOpen: null,
    showAdmin: true,
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

  handleCloseEditPiece = () => {
    this.setState({ editPiece: false });
  };

  handleToggle = () => {
    this.setState((state) => {
      return { showAdmin: !state.showAdmin };
    });
  };

  savePiece = (piece) => {
    const { organization, relay } = this.props;
    const { composers, arrangers, title, subtitle } = piece;
    this.setState({ editPiece: false, menuIsOpen: null });
    UpdatePieceMutation.commit(
      relay.environment,
      {
        id: organization.piece.id,
        composers: composers.split(","),
        arrangers: arrangers.split(","),
        title,
        subtitle,
      },
      undefined,
    );
  };

  render() {
    const { organization, viewer, router } = this.props;
    const { piece } = organization;
    const { isMusicAdmin } = viewer;
    const { showAdmin } = this.state;
    return (
      <Paper className="row">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1>
            {piece.title} <small>{piece.subtitle}</small>
          </h1>
          {isMusicAdmin ? (
            <PieceForm
              title="Rediger stykke"
              isOpen={this.state.editPiece}
              save={this.savePiece}
              cancel={this.handleCloseEditPiece}
              piece={piece}
              router={router}
            />
          ) : null}
          <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
            <ToolbarGroup lastChild>
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
                {isMusicAdmin ? (
                  <MenuItem
                    onClick={() => {
                      this.setState({ editPiece: !this.state.editPiece });
                    }}
                  >
                    Rediger info om stykke
                  </MenuItem>
                ) : null}
              </Menu>
            </ToolbarGroup>
          </Toolbar>
        </div>
        <h2>
          <TextList items={piece.composers} />{" "}
          <small>
            <TextList items={piece.arrangers} />
          </small>
        </h2>
        <List>
          {piece.files.edges.map((edge) => {
            return (
              <ListItem key={edge.node.id}>
                <a href={edge.node.path}>{edge.node.filename}</a>
              </ListItem>
            );
          })}
        </List>
        {piece.groupscores ? (
          <div>
            <h3>Alle stemmer</h3>
            {viewer.isMusicAdmin ? (
              <Toggle
                label="Admin"
                toggled={showAdmin}
                onToggle={this.handleToggle}
              />
            ) : null}
            {isMusicAdmin && showAdmin ? (
              <div>
                {piece.groupscores.map((groupscore) => {
                  return (
                    <GroupscoreUpload
                      key={groupscore.id}
                      groupscore={groupscore}
                      piece={piece}
                    />
                  );
                })}
              </div>
            ) : (
              <div>
                {piece.groupscores.map((groupscore) => {
                  return (
                    <GroupscoreList
                      groupscore={groupscore}
                      key={groupscore.id}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : null}
      </Paper>
    );
  }
}

export default createFragmentContainer(Piece, {
  organization: graphql`
    fragment Piece_organization on Organization {
      id
      name
      piece(pieceId: $pieceId) {
        id
        title
        subtitle
        composers
        arrangers
        files {
          edges {
            node {
              id
              filename
              path
            }
          }
        }
        groupscores {
          id
          ...GroupscoreUpload_groupscore
          ...GroupscoreList_groupscore
        }
      }
    }
  `,
  viewer: graphql`
    fragment Piece_viewer on User {
      id
      isMember
      isMusicAdmin
    }
  `,
});
