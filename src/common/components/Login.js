import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import React from 'react';
import { Card, CardTitle, CardText, CardActions } from 'material-ui/Card';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import theme from '../theme';

class Login extends React.Component {
    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }
    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        return (
            <section style={{ display: 'flex', flexWrap: 'wrap' }}>
                <form
                    action="/auth/login"
                    method="POST"
                    style={{
                        width: '50%',
                        minWidth: 300,
                        flexGrow: '1',
                        padding: theme.spacing.desktopGutterLess,
                    }}
                >
                    <Card>
                        <CardTitle>
                            <h1>Logg inn <small>om du har konto fra før</small></h1>
                        </CardTitle>
                        <CardText>
                            <p>Velkommen tilbake. Pålogging blir husket av nettleseren i en måned, så om du ikke vil være logget inn så lenge, må du logge ut fra din side.</p>
                            <div>
                                <TextField
                                    name="email"
                                    floatingLabelText="E-post eller brukernavn"
                                />
                            </div>
                            <div>
                                <TextField
                                    type="password"
                                    name="password"
                                    floatingLabelText="Passord"
                                />
                            </div>
                        </CardText>
                        <CardActions>
                            <div>
                                <RaisedButton
                                    type="submit"
                                    primary
                                    label="Logg inn"
                                />
                                <FlatButton
                                    label="Nytt passord"
                                />
                            </div>
                        </CardActions>
                    </Card>
                </form>
                <form
                    action="/auth/login"
                    method="POST"
                    style={{
                        width: '50%',
                        minWidth: 300,
                        flexGrow: '1',
                        padding: theme.spacing.desktopGutterLess,
                    }}
                >
                    <Card>
                        <CardTitle>
                            <h1>Registrer deg <small>om du er ny her</small></h1>
                        </CardTitle>
                        <CardText>
                            <p>Dette er valget for deg som ikke er har registrert deg tidligere, eller som ikke vet om du har blitt registrert av andre. Hvis du er registrert fra før, sender vi en lenke hvor du kan sette nytt passord.</p>
                            <div>
                                <TextField
                                    name="name"
                                    floatingLabelText="Fullt navn"
                                />
                            </div>
                            <div>
                                <TextField
                                    name="email"
                                    floatingLabelText="E-post eller brukernavn"
                                />
                            </div>
                            <div>
                                <TextField
                                    type="password"
                                    name="password"
                                    floatingLabelText="Passord"
                                />
                            </div>
                        </CardText>
                        <CardActions>
                            <div>
                                <RaisedButton
                                    type="submit"
                                    primary
                                    label="Registrer deg"
                                />
                            </div>
                        </CardActions>
                    </Card>
                </form>
            </section>
        );
    }
}

export default Login;
