import { Theme } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import withTheme from "@material-ui/core/styles/withTheme";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import SendResetMutation from "../mutations/SendReset";

type Props = {
  relay: RelayProp,
  theme: Theme,
};

type State = {
  email: string,
  sent: boolean,
};

class Reset extends React.Component<Props, State> {
  state = {
    email: "",
    sent: false,
  };

  onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  sendReset = (event) => {
    event.preventDefault();
    this.setState({ sent: true });
    SendResetMutation.commit(
      this.props.relay.environment,
      {
        email: this.state.email,
      },
      undefined,
    );
  };

  render() {
    const { theme } = this.props;
    const sentMessage =
      "Hvis du er registrert i systemet vil du snart motta en epost med en lenke til hvor du kan endre passordet.";
    const forgottenPasswordMessage =
      "Om du har glemt passordet, eller ikke fått noe passord til å begynne med, kan du få tilsendt en lenke hvor du kan sette nytt passord på epost. Vi trenger derfor epostadresse for å finne deg i databasen.";
    return (
      <section>
        <Paper style={{ padding: theme.spacing(2) }}>
          <h1>Nytt passord</h1>
          {this.state.sent ? (
            <div>
              <p>{sentMessage}</p>
            </div>
          ) : (
            <div>
              <p>{forgottenPasswordMessage}</p>
              <form onSubmit={this.sendReset}>
                <div>
                  <TextField
                    label="E-postadresse"
                    name="email"
                    onChange={this.onChangeEmail}
                    required
                    type="email"
                    value={this.state.email}
                  />
                </div>
                <div>
                  <Button variant="contained" type="submit" color="primary">
                    Send
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Paper>
      </section>
    );
  }
}

export default withTheme(
  createFragmentContainer(Reset, {
    organization: graphql`
      fragment Reset_organization on Organization {
        id
      }
    `,
  }),
);
