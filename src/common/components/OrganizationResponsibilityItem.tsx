import * as React from "react";
import Dialog from "material-ui/Dialog";
import { ListItem } from "material-ui/List";
import Button from "@material-ui/core/Button";
import TextField from "material-ui/TextField";
import ContentMail from "material-ui/svg-icons/content/mail";

type Props = {
  item: {
    id: string,
    name: string,
    reminderText: string,
    reminderAtHour: number,
    reminderDaysBefore: number,
  },
  onSave: any, //(string, string, string, number, number) => void,
};

type State = {
  open: boolean,
  name: string,
  reminderText: string,
  reminderAtHour: number,
  reminderDaysBefore: number,
};

export default class extends React.Component<Props, State> {
  state = {
    open: false,
    name: this.props.item.name,
    reminderText: this.props.item.reminderText,
    reminderAtHour: this.props.item.reminderAtHour,
    reminderDaysBefore: this.props.item.reminderDaysBefore,
  };

  onChangeName = (event: string, name: string) => {
    this.setState({ name });
  };

  onChangeReminderText = (event: any, reminderText: string) => {
    this.setState({ reminderText });
  };

  onChangeReminderAtHour = (event: any, reminderAtHour: number) => {
    this.setState({ reminderAtHour });
  };

  onChangeReminderDaysBefore = (event: any, reminderDaysBefore: number) => {
    this.setState({ reminderDaysBefore });
  };

  onSave = (event: any) => {
    event.preventDefault();
    this.closeEdit();
    const { id } = this.props.item;
    const {
      name,
      reminderText,
      reminderAtHour,
      reminderDaysBefore,
    } = this.state;
    this.props.onSave(
      id,
      name,
      reminderText,
      reminderAtHour,
      reminderDaysBefore,
    );
  };

  openEdit = () => {
    this.setState({ open: true });
  };

  closeEdit = () => {
    this.setState({ open: false });
  };

  render() {
    const responsibility = this.props.item;
    const rightIcon = responsibility.reminderText ? <ContentMail /> : null;
    const secondaryText = responsibility.reminderText
      ? `Epost sendes ut ${responsibility.reminderDaysBefore} dager før kl. ${responsibility.reminderAtHour}`
      : null;
    return (
      <ListItem
        key={responsibility.id}
        onClick={this.openEdit}
        primaryText={
          <div>
            {responsibility.name}
            <Dialog
              title="Rediger ansvar"
              open={this.state.open}
              onRequestClose={this.closeEdit}
              autoScrollBodyContent
            >
              <form onSubmit={this.onSave}>
                <div>
                  <TextField
                    floatingLabelText="Navn"
                    value={this.state.name}
                    onChange={this.onChangeName}
                  />
                </div>
                <div>
                  <TextField
                    floatingLabelText="Epostinnhold"
                    fullWidth
                    multiLine
                    value={this.state.reminderText}
                    onChange={this.onChangeReminderText}
                  />
                </div>
                <div>
                  <TextField
                    floatingLabelText="Sendes klokka"
                    type="number"
                    value={this.state.reminderAtHour}
                    onChange={this.onChangeReminderAtHour}
                  />
                </div>
                <div>
                  <TextField
                    floatingLabelText="Dager i forveien"
                    type="number"
                    value={this.state.reminderDaysBefore}
                    onChange={this.onChangeReminderDaysBefore}
                  />
                </div>
                <div>
                  <Button variant="contained" type="submit">
                    Lagre
                  </Button>
                </div>
              </form>
            </Dialog>
          </div>
        }
        secondaryText={secondaryText}
        rightIcon={rightIcon}
      />
    );
  }
}
