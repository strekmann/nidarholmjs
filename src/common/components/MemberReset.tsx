import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import React, { SyntheticEvent } from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import SetPasswordMutation from "../mutations/SetPassword";

type Props = {
  relay: RelayProp;
  router: {
    push: ({}) => void;
  };
  viewer: {
    id: string;
    passwordCode: string;
  };
};

type State = {
  newPassword: string;
};

class MemberReset extends React.Component<Props, State> {
  state = {
    newPassword: "",
  };

  onChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPassword: event.target.value });
  };

  setPassword = (event: SyntheticEvent) => {
    event.preventDefault();
    SetPasswordMutation.commit(
      this.props.relay.environment,
      {
        newPassword: this.state.newPassword,
        code: this.props.viewer.passwordCode,
      },
      () => {
        this.props.router.push({ pathname: `/users/${this.props.viewer.id}` });
      },
    );
  };

  render() {
    return (
      <Paper className="row">
        <form onSubmit={this.setPassword}>
          <h1>Sett nytt passord</h1>
          <p>
            Du bør ikke gjenbruke passord på flere nettsteder. Om ett nettsted
            blir hacket, må du da endre passord alle steder der passordet er
            brukt, og det er ikke enkelt å huske.
          </p>
          <div>
            <TextField
              label="Nytt passord"
              onChange={this.onChangeNewPassword}
              type="password"
              value={this.state.newPassword}
            />
          </div>
          <div>
            <Button variant="contained" type="submit" color="primary">
              Lagre
            </Button>
          </div>
        </form>
      </Paper>
    );
  }
}

export default createFragmentContainer(MemberReset, {
  organization: graphql`
    fragment MemberReset_organization on Organization {
      id
    }
  `,
  viewer: graphql`
    fragment MemberReset_viewer on User {
      id
      passwordCode(code: $code)
    }
  `,
});
