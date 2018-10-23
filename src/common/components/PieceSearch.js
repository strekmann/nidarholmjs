// @flow

import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import * as React from "react";

type Props = {
  term: string,
  onSearch: (string) => void,
  onClear: () => void,
};

type State = {
  term: string,
};

class PieceSearch extends React.Component<Props, State> {
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
          floatingLabelText="Tittel"
          value={this.state.term}
          onChange={this.onSearchChange}
        />
        <RaisedButton label="Søk" type="submit" primary />
        <RaisedButton
          label="Tøm"
          type="reset"
          onTouchTap={this.props.onClear}
        />
      </form>
    );
  }
}

export default PieceSearch;
