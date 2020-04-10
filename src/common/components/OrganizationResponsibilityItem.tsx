import * as React from "react";
import Dialog from "@material-ui/core/Dialog";
import ListItem from "@material-ui/core/ListItem";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import ContentMail from "@material-ui/icons/Mail";
import DialogTitle from "@material-ui/core/DialogTitle";
import { ListItemText, ListItemIcon } from "@material-ui/core";

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

  onChangeName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value });
  };

  onChangeReminderText = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ reminderText: event.target.value });
  };

  onChangeReminderAtHour = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ reminderAtHour: parseInt(event.target.value, 10) });
  };

  onChangeReminderDaysBefore = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ reminderDaysBefore: parseInt(event.target.value, 10) });
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
    const secondaryText = responsibility.reminderText
      ? `Epost sendes ut ${responsibility.reminderDaysBefore} dager før kl. ${responsibility.reminderAtHour}`
      : null;
    const primaryText = (
      <div>
        {responsibility.name}
        <Dialog open={this.state.open} onClose={this.closeEdit}>
          <DialogTitle>Rediger ansvar</DialogTitle>
          <form onSubmit={this.onSave}>
            <div>
              <TextField
                label="Navn"
                value={this.state.name}
                onChange={this.onChangeName}
              />
            </div>
            <div>
              <TextField
                label="Epostinnhold"
                fullWidth
                multiline
                value={this.state.reminderText}
                onChange={this.onChangeReminderText}
              />
            </div>
            <div>
              <TextField
                label="Sendes klokka"
                type="number"
                value={this.state.reminderAtHour}
                onChange={this.onChangeReminderAtHour}
              />
            </div>
            <div>
              <TextField
                label="Dager i forveien"
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
    );
    return (
      <ListItem key={responsibility.id} onClick={this.openEdit}>
        {responsibility.reminderText ? (
          <ListItemIcon>
            <ContentMail />
          </ListItemIcon>
        ) : null}
        <ListItemText inset primary={primaryText} secondary={secondaryText} />
      </ListItem>
    );
  }
}
