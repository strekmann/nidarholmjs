/* @flow */
/* eslint "max-len": 0 */

import AutoComplete from "material-ui/AutoComplete";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
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
  save: ({
    title: string,
    subtitle: string,
    composers: string,
    arrangers: string,
  }) => void,
  cancel: () => void,
  router: {
    push: ({
      pathname: string,
    }) => void,
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
      <Dialog
        title={this.props.title}
        open={this.props.isOpen}
        onRequestClose={this.props.cancel}
        autoScrollBodyContent
        actions={
          this.state.searching
            ? [
                <FlatButton label="Avbryt" onTouchTap={this.props.cancel} />,
                <FlatButton
                  label="Nytt stykke"
                  onTouchTap={() => {
                    this.setState({ searching: false });
                  }}
                  primary
                />,
              ]
            : [
                <FlatButton label="Avbryt" onTouchTap={this.props.cancel} />,
                <FlatButton
                  label="Lagre"
                  onTouchTap={this.savePiece}
                  primary
                />,
              ]
        }
      >
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
                floatingLabelText="Tittel"
                onChange={this.handleChangeTitle}
                value={this.state.title}
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Undertittel"
                onChange={this.handleChangeSubtitle}
                value={this.state.subtitle}
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Komponist(er)"
                onChange={this.handleChangeComposers}
                value={this.state.composers}
                hintText="Bruk komma som skilletegn"
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Arrangør(er)"
                onChange={this.handleChangeArrangers}
                value={this.state.arrangers}
                hintText="Bruk komma som skilletegn"
              />
            </div>
          </div>
        )}
      </Dialog>
    );
  }
}

export default PieceForm;
