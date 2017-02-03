import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import React from 'react';
import Relay from 'react-relay';

class ContactForm extends React.Component {
    static propTypes = {
        open: React.PropTypes.bool,
        save: React.PropTypes.func,
        close: React.PropTypes.func,
    }

    state = {
        name: '',
        email: '',
        text: '',
        sent: false,
    };

    onChangeName = (event, name) => {
        this.setState({ name });
    }

    onChangeEmail = (event, email) => {
        this.setState({ email });
    }

    onChangeText = (event, text) => {
        this.setState({ text });
    }

    close = () => {
        this.props.close();
    }

    sendEmail = (event) => {
        event.preventDefault();
        this.setState({ sent: true });
        this.props.save({
            name: this.state.name,
            email: this.state.email,
            text: this.state.text,
        });
    }

    render() {
        return (
            <Dialog
                title={this.state.sent
                    ? 'Meldingen er sendt!'
                    : 'Send melding til Nidarholm'
                }
                open={this.props.open}
                onRequestClose={this.toggle}
                autoScrollBodyContent
            >
                {this.state.sent
                        ? <div>
                            <p>Du vil få en bekreftelse på epost også</p>
                            <div>
                                <RaisedButton
                                    label="Lukk"
                                    onTouchTap={this.close}
                                />
                            </div>
                        </div>
                        : <form onSubmit={this.sendEmail}>
                            <p>Herfra kan du sende epost til styret i Nidarholm. Du kan også sende vanlig epost til {this.props.encodedEmail} om du heller foretrekker det.</p>
                            <div>
                                <TextField
                                    floatingLabelText="Ditt navn"
                                    onChange={this.onChangeName}
                                    value={this.state.name}
                                    required
                                />
                            </div>
                            <div>
                                <TextField
                                    floatingLabelText="Din e-postadresse"
                                    onChange={this.onChangeEmail}
                                    value={this.state.email}
                                    required
                                />
                            </div>
                            <div>
                                <TextField
                                    floatingLabelText="Melding"
                                    onChange={this.onChangeText}
                                    value={this.state.text}
                                    multiLine
                                    fullWidth
                                />
                            </div>
                            <div>
                                <RaisedButton
                                    type="submit"
                                    label="Send"
                                    primary
                                />
                                <RaisedButton
                                    type="reset"
                                    label="Avbryt"
                                    onTouchTap={this.close}
                                />
                            </div>
                        </form>
                }
            </Dialog>
        );
    }
}

export default Relay.createContainer(ContactForm, {
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            encodedEmail
        }`,
    },
});
