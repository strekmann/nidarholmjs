/* eslint "react/no-danger": 0 */

import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import { ContactForm_organization } from "./__generated__/ContactForm_organization.graphql";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogContent, DialogActions } from "@material-ui/core";

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

  onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };

  onChangeEmail = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value });
  };

  onChangeText = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ text: event.target.value });
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
      <Dialog open={this.props.open} onClose={this.close}>
        <DialogTitle>
          {this.state.sent
            ? "Meldingen er sendt!"
            : "Send melding til Nidarholm"}
        </DialogTitle>
        <form onSubmit={this.sendEmail}>
          {this.state.sent ? (
            <DialogContent>
              <p>Du vil få en bekreftelse på epost også</p>
            </DialogContent>
          ) : (
            <DialogContent>
              <p>
                Herfra kan du sende epost til styret i Nidarholm. Du kan også
                sende vanlig epost til{" "}
                <span dangerouslySetInnerHTML={{ __html: encodedEmail }} /> om
                du heller foretrekker det.
              </p>
              <div>
                <TextField
                  label="Ditt navn"
                  onChange={this.onChangeName}
                  value={this.state.name}
                  required
                />
              </div>
              <div>
                <TextField
                  label="Din e-postadresse"
                  onChange={this.onChangeEmail}
                  value={this.state.email}
                  required
                />
              </div>
              <div>
                <TextField
                  label="Melding"
                  onChange={this.onChangeText}
                  value={this.state.text}
                  multiline
                  fullWidth
                />
              </div>
            </DialogContent>
          )}
          {this.state.sent ? (
            <DialogActions>
              <Button variant="contained" onClick={this.close}>
                Lukk
              </Button>
            </DialogActions>
          ) : (
            <DialogActions>
              <Button variant="contained" type="reset" onClick={this.close}>
                Avbryt
              </Button>
              <Button variant="contained" type="submit" color="primary">
                Send
              </Button>
            </DialogActions>
          )}
        </form>
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
