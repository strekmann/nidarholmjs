/* @flow */

import type { RelayRefetchProp } from "react-relay";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import { MenuItem } from "material-ui/Menu";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHeaderColumn,
} from "material-ui/Table";
import { Toolbar, ToolbarGroup } from "material-ui/Toolbar";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import PropTypes from "prop-types";
import * as React from "react";
import { createRefetchContainer, graphql } from "react-relay";

import theme from "../theme";
import CreatePieceMutation from "../mutations/CreatePiece";

import PieceForm from "./PieceForm";
import PieceItem from "./PieceItem";
import PieceSearch from "./PieceSearch";

const itemsPerPage = 50;

type Props = {
  organization: {
    isMusicAdmin: boolean,
    pieces: {
      edges: Array<{
        node: {
          id: string,
          arrangers: Array<string>,
          composers: Array<string>,
          scoreCount: number,
          subtitle: string,
          title: string,
        },
      }>,
      pageInfo: {
        hasNextPage: boolean,
      },
    },
  },
  relay: RelayRefetchProp,
  router: {
    push: ({ pathname?: string }) => void,
  },
  location: {
    query: {
      term: string,
    },
  },
};

type State = {
  addPiece: boolean,
  term: string,
};

class Pieces extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    addPiece: false,
    term: "",
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  componentDidMount() {
    this.props.relay.refetch((variables) => {
      variables.term = this.state.term;
      return variables;
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.term !== this.state.term) {
      this.props.relay.refetch((variables) => {
        variables.term = this.state.term;
        return variables;
      });
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.location.query.term !== state.term) {
      return { term: props.location.query.term };
    }
    return null;
  }

  onClear = () => {
    this.props.router.push({
      ...this.props.location,
      query: { term: undefined },
    });
    this.props.relay.refetch((variables) => {
      variables.term = "";
      return variables;
    });
  };

  onSearch = (term) => {
    this.props.router.push({ ...this.props.location, query: { term } });
    this.props.relay.refetch((variables) => {
      variables.term = term;
      return variables;
    });
  };

  muiTheme: {};

  savePiece = (piece) => {
    this.setState({ addPiece: false });
    const { relay } = this.props;
    const { composers, arrangers, title, subtitle } = piece;
    CreatePieceMutation.commit(
      relay.environment,
      {
        composers: composers.split(","),
        arrangers: arrangers.split(","),
        title,
        subtitle,
      },
      () => {
        this.state.term = title;
        this.props.relay.refetch((variables) => {
          variables.term = title;
          return variables;
        });
      },
    );
  };

  closeAddPiece = () => {
    this.setState({ addPiece: false });
  };

  loadMore = () => {
    const { pieces } = this.props.organization;
    this.props.relay.refetch((variables) => {
      variables.term = this.state.term;
      variables.showItems = pieces.edges.length + itemsPerPage;
      return variables;
    });
  };

  render() {
    const { organization } = this.props;
    const { pieces, isMusicAdmin } = organization;
    const { desktopGutterLess } = theme.spacing;
    return (
      <Paper
        className="row"
        style={{
          paddingBottom: desktopGutterLess,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h1>Notearkivet</h1>
          {isMusicAdmin ? (
            <PieceForm
              title="Nytt stykke"
              isOpen={this.state.addPiece}
              save={this.savePiece}
              cancel={this.closeAddPiece}
              pieces={this.props.organization.pieces}
              search={this.onSearch}
              router={this.props.router}
              searching
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
                    primaryText="Nytt stykke"
                    onClick={() => {
                      this.setState({ addPiece: !this.state.addPiece });
                    }}
                  />
                ) : null}
                <MenuItem
                  primaryText="Last ned regneark"
                  href="/music/archive.xlsx"
                />
              </IconMenu>
            </ToolbarGroup>
          </Toolbar>
        </div>
        <PieceSearch
          term={this.state.term}
          onSearch={this.onSearch}
          onClear={this.onClear}
          key={this.state.term}
        />
        <Table>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Digitale stemmer</TableHeaderColumn>
              <TableHeaderColumn>Tittel</TableHeaderColumn>
              <TableHeaderColumn>Komponist (Arrangør)</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pieces.edges.map((edge) => {
              return <PieceItem key={edge.node.id} {...edge.node} />;
            })}
          </TableBody>
        </Table>
        {pieces.pageInfo.hasNextPage ? (
          <RaisedButton primary onClick={this.loadMore} label="Mer" />
        ) : null}
      </Paper>
    );
  }
}
/*
                                            <div>
                                                <TextField
                                                    label="Verkbeskrivelse"
                                                    onChange={this.handleChangeDescription}
                                                    value={this.state.description}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Tekst fra komponist"
                                                    onChange={this.handleChangeDescriptionComposer}
                                                    value={this.state.descriptionComposer}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Tekst fra arrangør"
                                                    onChange={this.handleChangeDescriptionArranger}
                                                    value={this.state.descriptionArranger}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Tekst fra utgiver"
                                                    onChange={this.handleChangeDescriptionPublisher}
                                                    value={this.state.descriptionPublisher}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Unikt nummer"
                                                    onChange={this.handleChangeUniqueNumber}
                                                    value={this.state.uniqueNumber}
                                                    type="number"
                                                />
                                                <TextField
                                                    label="Databasenummer"
                                                    onChange={this.handleChangeRecordNumber}
                                                    value={this.state.recordNumber}
                                                />
                                                <TextField
                                                    label="Arkivnummer"
                                                    onChange={this.handleChangeArchiveNumber}
                                                    value={this.state.archiveNumber}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Korpsoppsett"
                                                    onChange={this.handleChangeBandSetup}
                                                    value={this.state.bandSetup}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Kort sjanger"
                                                    onChange={this.handleChangeShortGenre}
                                                    value={this.state.shortGenre}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Sjanger"
                                                    onChange={this.handleChangeGenre}
                                                    value={this.state.genre}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Publisert"
                                                    onChange={this.handleChangePublished}
                                                    value={this.state.published}
                                                />
                                                <TextField
                                                    label="Innkjøpt"
                                                    onChange={this.handleChangeAquired}
                                                    value={this.state.acquired}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Vedlikeholdsstatus"
                                                    onChange={this.handleChangeMaintenanceStatus}
                                                    value={this.state.maintenanceStatus}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Nasjonalitet"
                                                    onChange={this.handleChangeNationality}
                                                    value={this.state.nationality}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Vanskelighetsgrad"
                                                    onChange={this.handleChangeDifficulty}
                                                    value={this.state.difficulty}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Publisher"
                                                    onChange={this.handleChangePublisher}
                                                    value={this.state.publisher}
                                                />
                                            </div>
                                            */

export default createRefetchContainer(
  Pieces,
  {
    organization: graphql`
      fragment Pieces_organization on Organization
        @argumentDefinitions(
          showItems: { type: "Int", defaultValue: 20 }
          term: { type: "String", defaultValue: "" }
        ) {
        id
        isMusicAdmin
        memberGroup {
          id
        }
        pieces(first: $showItems, term: $term) {
          edges {
            node {
              id
              title
              subtitle
              composers
              arrangers
              scoreCount
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
    query PiecesRefetchQuery($showItems: Int, $term: String) {
      organization {
        ...Pieces_organization @arguments(showItems: $showItems, term: $term)
      }
    }
  `,
);
