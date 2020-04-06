/* eslint "max-len": 0 */

import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";

import theme from "../theme";
import SetPasswordMutation from "../mutations/SetPassword";

type Props = {
  relay: RelayProp;
  router: {
    push: ({}) => void;
  };
  viewer: {
    id: string;
  };
};

type State = {
  newPassword: string;
  oldPassword: string;
};

class MemberReset extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props: Props) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  state = {
    oldPassword: "",
    newPassword: "",
  };

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onChangeOldPassword = (event, oldPassword) => {
    this.setState({ oldPassword });
  };

  onChangeNewPassword = (event, newPassword) => {
    this.setState({ newPassword });
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

  muiTheme: {};

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
              floatingLabelText="Gammelt passord"
              onChange={this.onChangeOldPassword}
              type="password"
              value={this.state.oldPassword}
            />
          </div>
          <div>
            <TextField
              floatingLabelText="Nytt passord"
              onChange={this.onChangeNewPassword}
              type="password"
              value={this.state.newPassword}
            />
          </div>
          <div>
            <RaisedButton label="Lagre" type="submit" primary />
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
