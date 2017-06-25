/* eslint "max-len": 0 */

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
import SendResetMutation from '../mutations/sendReset';

class Reset extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    static propTypes = {
        organization: PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        email: '',
        sent: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChangeEmail = (event, email) => {
        this.setState({ email });
    }

    sendReset = (event) => {
        event.preventDefault();
        this.setState({ sent: true });
        this.context.relay.commitUpdate(new SendResetMutation({
            email: this.state.email,
            organization: this.props.organization,
        }));
    }

    render() {
        const { desktopGutterLess } = theme.spacing;
        return (
            <section>
                <Paper style={{ padding: desktopGutterLess }}>
                    <h1>Nytt passord</h1>
                    {this.state.sent
                        ? <div>
                            <p>Hvis du er registrert i systemet vil du snart motta en epost med en lenke til hvor du kan endre passordet.</p>
                        </div>
                        : <div>
                            <p>Om du har glemt passordet, eller ikke fått noe passord til å begynne med, kan du få tilsendt en lenke hvor du kan sette nytt passord på epost. Vi trenger derfor epostadresse for å finne deg i databasen.</p>
                            <form onSubmit={this.sendReset}>
                                <div>
                                    <TextField
                                        floatingLabelText="E-postadresse"
                                        name="email"
                                        onChange={this.onChangeEmail}
                                        required
                                        type="email"
                                        value={this.state.email}
                                    />
                                </div>
                                <div>
                                    <RaisedButton
                                        label="Send"
                                        type="submit"
                                        primary
                                    />
                                </div>
                            </form>
                        </div>
                    }
                </Paper>
            </section>
        );
    }
}
export default Relay.createContainer(Reset, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                ${SendResetMutation.getFragment('organization')}
            }`;
        },
    },
});
