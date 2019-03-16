/* eslint "max-len": 0 */
/* eslint "react/no-danger": 0 */
// @flow

import Dialog from "material-ui/Dialog";
import RaisedButton from "material-ui/RaisedButton";
import TextField from "material-ui/TextField";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import ContactFormOrganization from "./__generated__/ContactForm_organization.graphql";

type SaveParams = {
  name: string,
  email: string,
  text: string,
};

type Props = {
  open: boolean,
  save: (SaveParams) => void,
  close: () => void,
  organization: ContactFormOrganization,
};

type State = {
  name: string,
  email: string,
  text: string,
  sent: boolean,
};

class ContactForm extends React.Component<Props, State> {
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
    const { close } = this.props;
    close();
  };

  sendEmail = (event) => {
    event.preventDefault();
    const { save } = this.props;
    const { name, email, text } = this.state;
    this.setState({ sent: true });
    save({
      name,
      email,
      text,
    });
  };

  render() {
    const { organization, open } = this.props;
    const { encodedEmail } = organization;
    const { sent, name, email, text } = this.state;
    return (
      <Dialog
        title={sent ? "Meldingen er sendt!" : "Send melding til Nidarholm"}
        open={open}
        onRequestClose={this.close}
        autoScrollBodyContent
      >
        {sent ? (
          <div>
            <p>Du vil få en bekreftelse på epost også</p>
            <div>
              <RaisedButton label="Lukk" onTouchTap={this.close} />
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
                value={name}
                required
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Din e-postadresse"
                onChange={this.onChangeEmail}
                value={email}
                required
              />
            </div>
            <div>
              <TextField
                floatingLabelText="Melding"
                onChange={this.onChangeText}
                value={text}
                multiLine
                fullWidth
              />
            </div>
            <div>
              <RaisedButton type="submit" label="Send" primary />
              <RaisedButton
                type="reset"
                label="Avbryt"
                onTouchTap={this.close}
              />
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
