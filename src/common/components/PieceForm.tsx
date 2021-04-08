import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import * as React from "react";
import Autocomplete, { AutocompleteOptionType } from "./Autocomplete";

type Props = {
  pieces?: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        subtitle: string;
        arrangers: Array<string>;
        composers: Array<string>;
        scoreCount: number;
      };
    }>;
  };
  piece?: {
    title: string;
    subtitle: string;
    composers: Array<string>;
    arrangers: Array<string>;
    archiveNumber?: string;
    maintenanceStatus?: string;
    published?: string;
    acquired?: string;
    publisher?: string;
    difficulty?: string;
    bandSetup?: string;
  };
  searching?: boolean;
  isOpen: boolean;
  title: string;
  save: any /*({
    title: string,
    subtitle: string,
    composers: string,
    arrangers: string,
  }) => void*/;
  cancel: () => void;
  router: {
    push: any /*({
      pathname?: string,
    }) => void*/;
  };
  search?: (text: string) => void;
};

type State = {
  title: string;
  subtitle: string;
  composers: string;
  arrangers: string;
  archiveNumber: string;
  maintenanceStatus: string;
  published: string;
  acquired: string;
  publisher: string;
  difficulty: string;
  bandSetup: string;
  searching: boolean;
};

class PieceForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { piece } = this.props;
    this.state = {
      title: piece && piece.title ? piece.title : "",
      subtitle: piece && piece.subtitle ? piece.subtitle : "",
      composers:
        piece && piece.composers && piece.composers.length
          ? piece.composers.join(", ")
          : "",
      arrangers:
        piece && piece.arrangers && piece.arrangers.length
          ? piece.arrangers.join(", ")
          : "",
      archiveNumber: piece?.archiveNumber ?? "",
      maintenanceStatus: piece?.maintenanceStatus ?? "",
      published: piece?.published ?? "",
      acquired: piece?.acquired ?? "",
      publisher: piece?.publisher ?? "",
      difficulty: piece?.difficulty ?? "",
      bandSetup: piece?.bandSetup ?? "",
      searching: this.props.searching ? this.props.searching : false,
    };
  }

  handleChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  };

  handleChangeSubtitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ subtitle: event.target.value });
  };

  handleChangeComposers = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ composers: event.target.value });
  };

  handleChangeArrangers = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ arrangers: event.target.value });
  };

  handleClickNewPiece = () => {
    this.setState({ searching: false });
  };

  goToPiece = (piece: AutocompleteOptionType) => {
    this.props.router.push({ pathname: `/music/${piece.id}` });
  };

  search = (title: string) => {
    this.setState({ title });
    if (this.props.search) {
      this.props.search(title);
    }
  };

  savePiece = (event: React.FormEvent) => {
    event.preventDefault();
    const {
      title,
      subtitle,
      composers,
      arrangers,
      archiveNumber,
      maintenanceStatus,
      published,
      acquired,
      publisher,
      difficulty,
      bandSetup,
    } = this.state;
    this.props.save({
      title,
      subtitle,
      composers,
      arrangers,
      archiveNumber: parseInt(archiveNumber, 10),
      maintenanceStatus,
      published,
      acquired,
      publisher,
      difficulty: parseInt(difficulty, 10),
      bandSetup,
    });
  };

  render() {
    const pieceOptions: AutocompleteOptionType[] =
      this.props.pieces?.edges.map((edge) => {
        const piece = edge.node;
        return {
          label: `${piece.scoreCount}: ${piece.title} - ${piece.composers.join(
            ", ",
          )} (${piece.arrangers.join(", ")})`,
          id: piece.id,
        };
      }) || [];
    return (
      <Dialog open={this.props.isOpen} onClose={this.props.cancel}>
        <form onSubmit={this.savePiece}>
          <DialogTitle>{this.props.title}</DialogTitle>
          <DialogContent>
            {this.state.searching && this.props.pieces ? (
              <div>
                <p>
                  Søk blant stykkene som allerede er i arkivet, og legg til nytt
                  hvis det ikke finnes
                </p>
                <Autocomplete
                  options={pieceOptions}
                  label="Tittel"
                  onChange={(
                    event: any,
                    selected: AutocompleteOptionType | null,
                  ) => {
                    if (selected) {
                      this.goToPiece(selected);
                    }
                  }}
                  onUpdateInput={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ) => {
                    this.search(event.target.value);
                  }}
                  fullWidth
                />
              </div>
            ) : (
              <div>
                <div>
                  <TextField
                    label="Tittel"
                    onChange={this.handleChangeTitle}
                    value={this.state.title}
                  />
                </div>
                <div>
                  <TextField
                    label="Undertittel"
                    onChange={this.handleChangeSubtitle}
                    value={this.state.subtitle}
                  />
                </div>
                <div>
                  <TextField
                    label="Komponist(er)"
                    onChange={this.handleChangeComposers}
                    value={this.state.composers}
                    helperText="Bruk komma som skilletegn"
                  />
                </div>
                <div>
                  <TextField
                    label="Arrangør(er)"
                    onChange={this.handleChangeArrangers}
                    value={this.state.arrangers}
                    helperText="Bruk komma som skilletegn"
                  />
                </div>
                <div>
                  <TextField
                    label="Arkivnummer"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ archiveNumber: event.target.value });
                    }}
                    value={this.state.archiveNumber}
                  />
                </div>
                <div>
                  <TextField
                    label="Vedlikeholdsstatus"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ maintenanceStatus: event.target.value });
                    }}
                    value={this.state.maintenanceStatus}
                  />
                </div>
                <div>
                  <TextField
                    label="Publisert år"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ published: event.target.value });
                    }}
                    value={this.state.published}
                  />
                </div>
                <div>
                  <TextField
                    label="Kjøpt"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ acquired: event.target.value });
                    }}
                    value={this.state.acquired}
                  />
                </div>
                <div>
                  <TextField
                    label="Forlag"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ publisher: event.target.value });
                    }}
                    value={this.state.publisher}
                  />
                </div>
                <div>
                  <TextField
                    label="Vanskelighetsgrad"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ difficulty: event.target.value });
                    }}
                    value={this.state.difficulty}
                  />
                </div>
                <div>
                  <TextField
                    label="Besetning"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      this.setState({ bandSetup: event.target.value });
                    }}
                    value={this.state.bandSetup}
                  />
                </div>
              </div>
            )}
          </DialogContent>
          {this.state.searching ? (
            <DialogActions>
              <Button onClick={this.props.cancel}>Avbryt</Button>
              <Button
                onClick={() => {
                  this.setState({ searching: false });
                }}
                color="primary"
              >
                Nytt stykke
              </Button>
            </DialogActions>
          ) : (
            <DialogActions>
              <Button variant="text" onClick={this.props.cancel}>
                Avbryt
              </Button>
              <Button variant="text" type="submit" color="primary">
                Lagre
              </Button>
            </DialogActions>
          )}
        </form>
      </Dialog>
    );
  }
}

export default PieceForm;
