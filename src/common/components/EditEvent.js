import React from 'react';
import moment from 'moment';

import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import Chip from 'material-ui/Chip';

export default class EditEvent extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        title: React.PropTypes.string,
        location: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tags: React.PropTypes.array,
        year: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        saveEvent: React.PropTypes.func,
        closeEdit: React.PropTypes.func,
    }

    state = {
        id: this.props.id,
        title: this.props.title,
        location: this.props.location,
        start: moment(this.props.start).toDate(),
        end: moment(this.props.end).toDate(),
        tags: this.props.tags,
        mdtext: this.props.mdtext,
    }

    onChangeTitle = (event, title) => {
        this.setState({ title });
    }

    onChangeStart = (event, date) => {
        this.setState({ start: date });
    }
    onChangeEnd = (event, date) => {
        this.setState({ end: date });
    }

    onChangeStartDate = (event, date) => {
        this.setState({
            start: moment(this.state.start).set({
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate(),
            }).toDate(),
        });
    }

    onChangeEndDate = (event, date) => {
        this.setState({
            end: moment(this.state.end).set({
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate(),
            }).toDate(),
        });
    }

    onChangeDescription = (event, mdtext) => {
        this.setState({ mdtext });
    }

    saveEvent = () => {
        this.props.saveEvent(this.state, this.props.closeEdit);
    }

    renderChip(data, key) {
        return (
            <Chip
                key={key}
            >
                {data}
            </Chip>
        );
    }

    render() {
        return (
            <form>
                <div>
                    <TextField
                        value={this.state.title}
                        floatingLabelText="Tittel"
                        onChange={this.onChangeTitle}
                    />
                </div>
                <div>
                    <TextField
                        value={this.state.location}
                        floatingLabelText="Sted"
                    />
                </div>
                <div>
                    <DatePicker
                        value={this.state.start}
                        floatingLabelText="Start"
                        onChange={this.onChangeStartDate}
                    />
                    <TimePicker
                        value={this.state.start}
                        floatingLabelText="Klokkeslett"
                        format="24hr"
                        onChange={this.onChangeStart}
                    />
                </div>
                <div>
                    <DatePicker
                        value={this.state.end}
                        floatingLabelText="Slutt"
                        onChange={this.onChangeEndDate}
                    />
                    <TimePicker
                        value={this.state.end}
                        floatingLabelText="Klokkeslett"
                        format="24hr"
                        onChange={this.onChangeEnd}
                    />
                </div>
                <div>
                    <TextField
                        value={this.state.mdtext}
                        floatingLabelText="Beskrivelse"
                        multiLine
                        onChange={this.onChangeDescription}
                    />
                </div>
                <div>
                    {this.state.tags.map((tag, i) => this.renderChip(tag, i))}
                </div>
                <div>
                    <TextField
                        value={this.state.location}
                        floatingLabelText="Rettigheter"
                    />
                </div>
                <div>
                    <RaisedButton onClick={this.saveEvent} label="Lagre" />
                </div>
            </form>
        );
    }
}
