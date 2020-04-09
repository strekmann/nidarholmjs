import AutoComplete from "material-ui/AutoComplete";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import * as React from "react";

type Props = {
  pieces?: {
    edges: Array<{
      node: {
        id: string,
        title: string,
        subtitle: string,
        arrangers: Array<string>,
        composers: Array<string>,
        scoreCount: number,
      },
    }>,
  },
  piece?: {
    title: string,
    subtitle: string,
    composers: Array<string>,
    arrangers: Array<string>,
  },
  searching?: boolean,
  isOpen: boolean,
  title: string,
  save: any /*({
    title: string,
    subtitle: string,
    composers: string,
    arrangers: string,
  }) => void*/,
  cancel: () => void,
  router: {
    push: any /*({
      pathname?: string,
    }) => void*/,
  },
  search?: (string) => void,
};

type State = {
  title: string,
  subtitle: string,
  composers: string,
  arrangers: string,
  searching: boolean,
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
      searching: this.props.searching ? this.props.searching : false,
    };
  }

  handleChangeTitle = (event: void, title: string) => {
    this.setState({ title });
  };

  handleChangeSubtitle = (event: void, subtitle: string) => {
    this.setState({ subtitle });
  };

  handleChangeComposers = (event: void, composers: string) => {
    this.setState({ composers });
  };

  handleChangeArrangers = (event: void, arrangers: string) => {
    this.setState({ arrangers });
  };

  handleClickNewPiece = () => {
    this.setState({ searching: false });
  };

  goToPiece = (piece: { id: string }) => {
    this.props.router.push({ pathname: `/music/${piece.id}` });
  };

  search = (title: string) => {
    this.setState({ title });
    if (this.props.search) {
      this.props.search(title);
    }
  };

  savePiece = () => {
    const { title, subtitle, composers, arrangers } = this.state;
    this.props.save({
      title,
      subtitle,
      composers,
      arrangers,
    });
  };

  render() {
    return (
      <Dialog open={this.props.isOpen} onClose={this.props.cancel}>
        <DialogTitle>{this.props.title}</DialogTitle>
        <DialogContent>
          {this.state.searching && this.props.pieces ? (
            <div>
              <p>
                Søk blant stykkene som allerede er i arkivet, og legg til nytt
                hvis det ikke finnes
              </p>
              <AutoComplete
                dataSource={this.props.pieces.edges.map((edge) => {
                  const piece = edge.node;
                  return {
                    text: `${piece.scoreCount}: ${
                      piece.title
                    } - ${piece.composers.join(", ")} (${piece.arrangers.join(
                      ", ",
                    )})`,
                    value: piece,
                  };
                })}
                floatingLabelText="Tittel"
                onNewRequest={(selected) => {
                  this.goToPiece(selected.value);
                }}
                onUpdateInput={(text) => {
                  this.search(text);
                }}
                filter={() => {
                  return true;
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
                  hintText="Bruk komma som skilletegn"
                />
              </div>
              <div>
                <TextField
                  label="Arrangør(er)"
                  onChange={this.handleChangeArrangers}
                  value={this.state.arrangers}
                  hintText="Bruk komma som skilletegn"
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
            <Button variant="text" onClick={this.savePiece} color="primary">
              Lagre
            </Button>
          </DialogActions>
        )}
      </Dialog>
    );
  }
}

export default PieceForm;
