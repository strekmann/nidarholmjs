/* @flow */

import FlatButton from "material-ui/FlatButton";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import { MenuItem } from "material-ui/Menu";
import Paper from "material-ui/Paper";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";
import UpdatePieceMutation from "../mutations/UpdatePiece";

import List from "./List";
import Groupscore from "./Groupscore";
import PieceForm from "./PieceForm";

type Props = {
  organization: {
    isMusicAdmin: boolean,
    piece: {
      arrangers: Array<string>,
      composers: Array<string>,
      id: string,
      files: {
        edges: Array<{
          node: {
            id: string,
            filename: string,
            path: string,
          },
        }>,
      },
      groupscores: Array<{
        id: string,
      }>,
      subtitle: string,
      title: string,
    },
  },
  relay: {
    environment: {},
  },
  router: {
    push: ({
      pathname: string,
    }) => void,
  },
};

type State = {
  editPiece: boolean,
};

class Piece extends React.Component<Props, State> {
  static propTypes = {
    organization: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    editPiece: false,
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

  handleCloseEditPiece = () => {
    this.setState({ editPiece: false });
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
    const { organization, router } = this.props;
    const { piece, isMusicAdmin } = organization;
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
          <List items={piece.composers} />{" "}
          <small>
            <List items={piece.arrangers} />
          </small>
        </h2>
        {piece.files.edges.map((edge) => {
          return (
            <div key={edge.node.id}>
              <FlatButton href={edge.node.path} label={edge.node.filename} />
            </div>
          );
        })}
        {isMusicAdmin ? (
          <div>
            <h2>Admin</h2>
            {piece.groupscores.map((groupscore) => {
              return (
                <Groupscore
                  key={groupscore.id}
                  groupscore={groupscore}
                  piece={piece}
                />
              );
            })}
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
      isMember
      isMusicAdmin
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
          ...Groupscore_groupscore
        }
      }
    }
  `,
});
