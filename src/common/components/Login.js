import React from 'react';
import { TextField, RaisedButton } from 'material-ui';
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'material-ui/Card';
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
            <section>
                <form action="/auth/login" method="POST">
                    <Card>
                        <CardTitle>Logg inn</CardTitle>
                        <CardText>
                            <div>
                                <TextField
                                    name="email"
                                    placeholder="E-post eller brukernavn"
                                />
                            </div>
                            <div>
                                <TextField
                                    type="password"
                                    name="password"
                                    placeholder="Passord"
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
                            </div>
                        </CardActions>
                    </Card>
                </form>
            </section>
        );
    }
}

export default Login;
