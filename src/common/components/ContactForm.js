/* eslint "max-len": 0 */
/* eslint "react/no-danger": 0 */

import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import PropTypes from "prop-types";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

class ContactForm extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    save: PropTypes.func,
    close: PropTypes.func,
    encodedEmail: PropTypes.string,
    organization: PropTypes.object,
  };

  state = {
    name: "",
    email: "",
    text: "",
    sent: false,
  };

  onChangeName = (event, name) => {
    this.setState({ name });
  };

  onChangeEmail = (event, email) => {
    this.setState({ email });
  };

  onChangeText = (event, text) => {
    this.setState({ text });
  };

  close = () => {
    this.props.close();
  };

  sendEmail = (event) => {
    event.preventDefault();
    this.setState({ sent: true });
    this.props.save({
      name: this.state.name,
      email: this.state.email,
      text: this.state.text,
    });
  };

  render() {
    const { encodedEmail } = this.props.organization;
    return (
      <Dialog
        title={
          this.state.sent ? "Meldingen er sendt!" : "Send melding til Nidarholm"
        }
        open={this.props.open}
        onRequestClose={this.close}
        autoScrollBodyContent
      >
        {this.state.sent ? (
          <div>
            <p>Du vil få en bekreftelse på epost også</p>
            <div>
              <RaisedButton label="Lukk" onClick={this.close} />
            </div>
          </div>
        ) : (
          <form onSubmit={this.sendEmail}>
            <p>
              Herfra kan du sende epost til styret i Nidarholm. Du kan også
              sende vanlig epost til{" "}
              <span dangerouslySetInnerHTML={{ __html: encodedEmail }} /> om du
              heller foretrekker det.
            </p>
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
              <RaisedButton type="submit" label="Send" primary />
              <RaisedButton type="reset" label="Avbryt" onClick={this.close} />
            </div>
          </form>
        )}
      </Dialog>
    );
  }
}

export default createFragmentContainer(
  ContactForm,
  graphql`
    fragment ContactForm_organization on Organization {
      encodedEmail
    }
  `,
);
