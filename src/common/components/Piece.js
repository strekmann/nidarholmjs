/* @flow */

import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import { List, ListItem } from "material-ui/List";
import { MenuItem } from "material-ui/Menu";
import Paper from "material-ui/Paper";
import Toggle from "material-ui/Toggle";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";
import UpdatePieceMutation from "../mutations/UpdatePiece";

import TextList from "./List";
import GroupscoreList from "./GroupscoreList";
import GroupscoreUpload from "./GroupscoreUpload";
import PieceForm from "./PieceForm";
import type PieceOrganization from "./__generated__/Piece_organization.graphql";
import type PieceViewer from "./__generated__/Piece_viewer.graphql";

type Props = {
  organization: PieceOrganization,
  viewer: PieceViewer,
  relay: {
    environment: {},
  },
  router: {
    push: ({
      pathname?: string,
    }) => void,
  },
};

type State = {
  editPiece: boolean,
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
    showAdmin: true,
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

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
    this.setState({ editPiece: false });
    UpdatePieceMutation.commit(relay.environment, {
      id: organization.piece.id,
      composers: composers.split(","),
      arrangers: arrangers.split(","),
      title,
      subtitle,
    });
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
              <IconMenu
                iconButtonElement={
                  <IconButton>
                    <MoreVertIcon />
                  </IconButton>
                }
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                targetOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {isMusicAdmin ? (
                  <MenuItem
                    primaryText="Rediger info om stykke"
                    onTouchTap={() => {
                      this.setState({ editPiece: !this.state.editPiece });
                    }}
                  />
                ) : null}
              </IconMenu>
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
              <ListItem
                disabled
                key={edge.node.id}
                primaryText={<a href={edge.node.path}>{edge.node.filename}</a>}
              />
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
