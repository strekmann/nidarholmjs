import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import withTheme from "@material-ui/core/styles/withTheme";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import React from "react";
import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay";
import CreatePieceMutation from "../mutations/CreatePiece";
import PieceForm from "./PieceForm";
import PieceItem from "./PieceItem";
import PieceSearch from "./PieceSearch";
import { Pieces_organization } from "./__generated__/Pieces_organization.graphql";

const itemsPerPage = 50;

type Props = {
  organization: Pieces_organization,
  relay: RelayRefetchProp,
  router: {
    push: any, //({ pathname?: string }) => void,
  },
  location: {
    query: {
      term: string,
    },
  },
  theme: Theme,
};

type State = {
  addPiece: boolean,
  menuIsOpen: null | HTMLElement,
  term: string,
};

class Pieces extends React.Component<Props, State> {
  state = {
    addPiece: false,
    menuIsOpen: null,
    term: "",
  };

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
    if (props.match.location.query.term !== state.term) {
      return { term: props.match.location.query.term };
    }
    return null;
  }

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

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

  onSearch = (term: string, next: string) => {
    this.props.router.push({ ...this.props.match.location, query: { term } });
    this.props.relay.refetch((variables) => {
      variables.term = term;
      return variables;
    });
  };

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
      variables.showItems = pieces?.edges?.length || 0 + itemsPerPage;
      return variables;
    });
  };

  render() {
    const { organization, theme } = this.props;
    const { pieces, isMusicAdmin } = organization;
    return (
      <Paper
        className="row"
        style={{
          paddingBottom: theme.spacing(2),
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
              pieces={pieces}
              search={this.onSearch}
              router={this.props.router}
              searching
            />
          ) : null}
          <Toolbar>
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
                {isMusicAdmin ? (
                  <MenuItem
                    onClick={() => {
                      this.setState({ addPiece: !this.state.addPiece });
                    }}
                  >
                    Nytt stykke
                  </MenuItem>
                ) : null}
                <MenuItem href="/music/archive.xlsx">
                  Last ned regneark
                </MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </div>
        <PieceSearch
          term={this.state.term}
          onSearch={this.onSearch}
          onClear={this.onClear}
          key={this.state.term}
        />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Digitale stemmer</TableCell>
              <TableCell>Tittel</TableCell>
              <TableCell>Komponist (Arrangør)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pieces.edges.map((edge) => {
              return <PieceItem key={edge.node.id} {...edge.node} />;
            })}
          </TableBody>
        </Table>
        {pieces.pageInfo.hasNextPage ? (
          <Button variant="contained" color="primary" onClick={this.loadMore}>
            Mer
          </Button>
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

export default withTheme(
  createRefetchContainer(
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
  ),
);
