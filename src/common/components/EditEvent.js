import React from 'react';
import moment from 'moment';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import Subheader from 'material-ui/Subheader';
import TimePicker from 'material-ui/TimePicker';
import Chip from 'material-ui/Chip';
import { List } from 'material-ui/List';
import PermissionItem from './PermissionItem';

export default class EditEvent extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        title: React.PropTypes.string,
        location: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tags: React.PropTypes.array,
        permissions: React.PropTypes.array,
        mdtext: React.PropTypes.string,
        saveEvent: React.PropTypes.func,
        closeEdit: React.PropTypes.func,
        viewer: React.PropTypes.object,
    }

    state = {
        id: this.props.id,
        title: this.props.title,
        location: this.props.location,
        start: this.props.start ? moment(this.props.start).toDate() : null,
        end: this.props.end ? moment(this.props.end).toDate() : null,
        tags: this.props.tags,
        mdtext: this.props.mdtext,
        permissions: this.props.permissions || [],
    }

    onChangeTitle = (event, title) => {
        this.setState({ title });
    }

    onChangeLocation = (event, location) => {
        this.setState({ location });
    }

    onChangeStart = (event, date) => {
        this.setState({ start: date });
    }
    onChangeEnd = (event, date) => {
        this.setState({ end: date });
    }

    onChangeStartDate = (event, date) => {
        if (!this.state.start) {
            this.setState({ start: date });
        }
        else {
            this.setState({
                start: moment(this.state.start).set({
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    date: date.getDate(),
                }).toDate(),
            });
        }
    }

    onChangeEndDate = (event, date) => {
        if (!this.state.end) {
            this.setState({ end: date });
        }
        else {
            this.setState({
                end: moment(this.state.end).set({
                    year: date.getFullYear(),
                    month: date.getMonth(),
                    date: date.getDate(),
                }).toDate(),
            });
        }
    }

    onChangeDescription = (event, mdtext) => {
        this.setState({ mdtext });
    }

    onPermissionChange = (value) => {
        this.setState({
            permission: value,
        });
    }

    addPermission = (chosen) => {
        const permissions = this.state.permissions;
        permissions.push(chosen);
        this.setState({
            permissions,
            permission: '',
        });
    }

    removePermission = (permissionId) => {
        const permissions = this.state.permissions.filter((_p) => {
            return _p.value !== permissionId;
        });
        this.setState({
            permissions,
        });
    }

    saveEvent = () => {
        this.props.saveEvent(this.state, this.props.closeEdit);
    }

    renderChip = (data, key) => {
        return (
            <Chip
                key={key}
            >
                {data}
            </Chip>
        );
    }

    render() {
        const viewer = this.props.viewer;
        const permissions = [];
        if (viewer) {
            permissions.push({ value: 'p', text: 'Verden' });
            viewer.groups.forEach((group) => {
                permissions.push({ value: group.id, text: group.name });
            });
        }
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
                        onChange={this.onChangeLocation}
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
                    {this.state.tags
                        ? this.state.tags.map((tag, i) => {
                            return this.renderChip(tag, i);
                        })
                        : null
                    }
                </div>
                <div>
                    <List>
                        <Subheader>Rettigheter</Subheader>
                        {this.state.permissions.map((permission) => {
                            return (
                                <PermissionItem
                                    key={permission.value}
                                    removePermission={this.removePermission}
                                    {...permission}
                                />
                            );
                        })}
                    </List>
                    <AutoComplete
                        id="permissions"
                        floatingLabelText="Legg til rettigheter"
                        filter={AutoComplete.fuzzyFilter}
                        dataSource={permissions}
                        maxSearchResults={8}
                        searchText={this.state.permission}
                        onNewRequest={this.addPermission}
                        onUpdateInput={this.onPermissionChange}
                    />
                </div>
                <div>
                    <RaisedButton onClick={this.saveEvent} label="Lagre" />
                </div>
            </form>
        );
    }
}
