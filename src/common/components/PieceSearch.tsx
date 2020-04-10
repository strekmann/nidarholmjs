import Button from "@material-ui/core/Button";
import TextField from "material-ui/TextField";
import * as React from "react";

type Props = {
  term: string,
  onSearch: (term: string) => void,
  onClear: () => void,
};

type State = {
  term: string,
};

export default class PieceSearch extends React.Component<Props, State> {
  state = {
    term: this.props.term,
  };

  onSearchChange = (event: SyntheticEvent<HTMLButtonElement>, term: string) => {
    this.setState({
      term,
    });
  };

  onSearch = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onSearch(this.state.term);
  };

  render() {
    return (
      <form onSubmit={this.onSearch}>
        <TextField
          id="term"
          floatingLabelText="Tittel, komponist eller arrangør"
          value={this.state.term}
          onChange={this.onSearchChange}
        />
        <Button variant="contained" type="submit" color="primary">
          Søk
        </Button>
        <Button variant="contained" type="reset" onClick={this.props.onClear}>
          Tøm
        </Button>
      </form>
    );
  }
}
