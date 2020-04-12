/* eslint "max-len": 0 */

import Link from "found/Link";
import { Card, CardTitle, CardText, CardActions } from "material-ui/Card";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";

import theme from "../theme";

type Props = {};

class Login extends React.Component<Props> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };
  constructor(props: {}) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  muiTheme: {};

  render() {
    const { desktopGutterLess } = theme.spacing;
    return (
      <section style={{ display: "flex", flexWrap: "wrap" }}>
        <form
          action="/login"
          method="POST"
          style={{
            width: "50%",
            minWidth: 300,
            flexGrow: 1,
            padding: desktopGutterLess,
          }}
        >
          <Card>
            <CardTitle>
              <h1>
                Logg inn <small>om du har konto fra før</small>
              </h1>
            </CardTitle>
            <CardText>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <Button variant="contained" href="/login/facebook">
                  Logg inn med Facebook
                </Button>
                <Button variant="contained" href="/login/google">
                  Logg inn med Google
                </Button>
              </div>
              <p>
                Velkommen tilbake. Pålogging blir husket av nettleseren i en
                måned, så om du ikke vil være logget inn så lenge, må du logge
                ut fra din side.
              </p>
              <div>
                <TextField name="email" label="E-post eller brukernavn" />
              </div>
              <div>
                <TextField type="password" name="password" label="Passord" />
              </div>
            </CardText>
            <CardActions>
              <div>
                <Button variant="contained" type="submit" color="primary">
                  Logg inn
                </Button>
                <Link to="/login/reset">
                  <Button variant="text">Nytt passord</Button>
                </Link>
              </div>
            </CardActions>
          </Card>
        </form>
        <form
          action="/login/register"
          method="POST"
          style={{
            width: "50%",
            minWidth: 300,
            flexGrow: 1,
            padding: desktopGutterLess,
          }}
        >
          <Card>
            <CardTitle>
              <h1>
                Registrer deg <small>om du er ny her</small>
              </h1>
            </CardTitle>
            <CardText>
              <p>
                Dette er valget for deg som ikke er har registrert deg
                tidligere, eller som ikke vet om du har blitt registrert av
                andre. Hvis du er registrert fra før, sender vi en lenke hvor du
                kan sette nytt passord.
              </p>
              <div>
                <TextField name="name" label="Fullt navn" />
              </div>
              <div>
                <TextField name="email" label="E-post eller brukernavn" />
              </div>
              <div>
                <TextField type="password" name="password" label="Passord" />
              </div>
            </CardText>
            <CardActions>
              <div>
                <Button color="primary" type="submit">
                  Registrer deg
                </Button>
              </div>
            </CardActions>
          </Card>
        </form>
      </section>
    );
  }
}

export default Login;
