/* eslint "max-len": 0 */
// @flow

import type { RelayProp } from "react-relay";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import theme from "../theme";
import SendResetMutation from "../mutations/SendReset";

type Props = {
  relay: RelayProp,
};

type State = {
  email: string,
  sent: boolean,
};

class Reset extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    email: "",
    sent: false,
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onChangeEmail = (event, email) => {
    this.setState({ email });
  };

  sendReset = (event) => {
    event.preventDefault();
    const { relay } = this.props;
    const { email } = this.state;
    this.setState({ sent: true });
    SendResetMutation.commit(relay.environment, {
      email,
    });
  };

  muiTheme: {};

  render() {
    const { email, sent } = this.state;
    const { desktopGutterLess } = theme.spacing;
    const sentMessage =
      "Hvis du er registrert i systemet vil du snart motta en epost med en lenke til hvor du kan endre passordet.";
    const forgottenPasswordMessage =
      "Om du har glemt passordet, eller ikke fått noe passord til å begynne med, kan du få tilsendt en lenke hvor du kan sette nytt passord på epost. Vi trenger derfor epostadresse for å finne deg i databasen.";
    return (
      <section>
        <Paper style={{ padding: desktopGutterLess }}>
          <h1>Nytt passord</h1>
          {sent ? (
            <div>
              <p>{sentMessage}</p>
            </div>
          ) : (
            <div>
              <p>{forgottenPasswordMessage}</p>
              <form onSubmit={this.sendReset}>
                <div>
                  <TextField
                    floatingLabelText="E-postadresse"
                    name="email"
                    onChange={this.onChangeEmail}
                    required
                    type="email"
                    value={email}
                  />
                </div>
                <div>
                  <RaisedButton label="Send" type="submit" primary />
                </div>
              </form>
            </div>
          )}
        </Paper>
      </section>
    );
  }
}
export default createFragmentContainer(Reset, {
  organization: graphql`
    fragment Reset_organization on Organization {
      id
    }
  `,
});
