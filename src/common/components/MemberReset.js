/* eslint "max-len": 0 */

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
import SetPasswordMutation from '../mutations/setPassword';

class MemberReset extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        viewer: React.PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        oldPassword: '',
        newPassword: '',
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChangeOldPassword = (event, oldPassword) => {
        this.setState({ oldPassword });
    }

    onChangeNewPassword = (event, newPassword) => {
        this.setState({ newPassword });
    }

    setPassword = (event) => {
        event.preventDefault();
        this.context.relay.commitUpdate(new SetPasswordMutation({
            oldPassword: this.state.oldPassword,
            newPassword: this.state.newPassword,
            viewer: this.props.viewer,
        }));
        this.context.router.push({ pathname: `/users/${this.props.viewer.id}` });
    }

    render() {
        return (
            <Paper className="row">
                <form onSubmit={this.setPassword}>
                    <h1>Sett nytt passord</h1>
                    <p>For å sette nytt passord, trenger du å kunne det gamle og et nytt passord.</p>
                    <p>Det er dumt å gjenbruke samme passord flere steder, da en som har snappet opp passordet da kan komme seg inn flere steder.</p>
                    <p>Trafikken mellom nettleseren din og dette nettstedet er kryptert og kan ikke snappes opp av andre.</p>
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
                        <RaisedButton
                            label="Lagre"
                            type="submit"
                            primary
                        />
                    </div>
                </form>
            </Paper>
        );
    }
}

export default Relay.createContainer(MemberReset, {
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
                ${SetPasswordMutation.getFragment('viewer')}
            }`;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
            }`;
        },
    },
});
