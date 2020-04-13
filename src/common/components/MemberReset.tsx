import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import SetPasswordMutation from "../mutations/SetPassword";

type Props = {
  relay: RelayProp,
  router: {
    push: ({}) => void,
  },
  viewer: {
    id: string,
  },
};

type State = {
  newPassword: string,
  oldPassword: string,
};

class MemberReset extends React.Component<Props, State> {
  state = {
    oldPassword: "",
    newPassword: "",
  };

  onChangeOldPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ oldPassword: event.target.value });
  };

  onChangeNewPassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPassword: event.target.value });
  };

  setPassword = (event) => {
    event.preventDefault();
    SetPasswordMutation.commit(
      this.props.relay.environment,
      {
        oldPassword: this.state.oldPassword,
        newPassword: this.state.newPassword,
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
          <p>For å sette nytt passord, trenger du å huske det gamle.</p>
          <p>
            Du bør ikke bruke samme passord flere steder, da en som har snappet
            opp passordet da kan komme seg inn flere steder.
          </p>
          <div>
            <TextField
              label="Gammelt passord"
              onChange={this.onChangeOldPassword}
              type="password"
              value={this.state.oldPassword}
            />
          </div>
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
    }
  `,
});
