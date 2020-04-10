/* eslint "react/no-danger": 0 */

import Dialog from "material-ui/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "material-ui/TextField";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { ContactForm_organization } from "./__generated__/ContactForm_organization.graphql";

type Props = {
  open: boolean,
  save: any,
  close: any,
  organization: ContactForm_organization,
};

class ContactForm extends React.Component<Props> {
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
              <Button onClick={this.close}>Lukk</Button>
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
              <Button type="submit" color="primary">
                Send
              </Button>
              <Button type="reset" onClick={this.close}>
                Avbryt
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    );
  }
}

export default createFragmentContainer(ContactForm, {
  organization: graphql`
    fragment ContactForm_organization on Organization {
      encodedEmail
    }
  `,
});
