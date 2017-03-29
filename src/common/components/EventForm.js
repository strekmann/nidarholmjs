/* eslint "no-nested-ternary": 0 */

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';
import Chip from 'material-ui/Chip';
import moment from 'moment';
import React from 'react';
import Relay from 'react-relay';

import { flattenPermissions } from '../utils';

import PermissionField from './PermissionField';

class EventForm extends React.Component {
    static propTypes = {
        title: React.PropTypes.string.isRequired,
        event: React.PropTypes.object,
        viewer: React.PropTypes.object,
        isOpen: React.PropTypes.bool.isRequired,
        save: React.PropTypes.func.isRequired,
        cancel: React.PropTypes.func.isRequired,
        projectPermissions: React.PropTypes.object,
    }

    state = {
        id: this.props.event ? this.props.event.id : null,
        title: this.props.event ? this.props.event.title : '',
        location: this.props.event ? this.props.event.location : '',
        start: (this.props.event && this.props.event.start
            ? moment(this.props.event.start).toDate()
            : null
        ),
        end: (this.props.event && this.props.event.end
            ? moment(this.props.event.end).toDate()
            : null
        ),
        tags: this.props.event ? this.props.event.tags : [],
        mdtext: this.props.event ? this.props.event.mdtext : '',
        permissions: (this.props.event
            ? (this.props.event.permissions
                ? flattenPermissions(this.props.event.permissions)
                : []
            )
            : (this.props.projectPermissions
                ? flattenPermissions(this.props.projectPermissions)
                : []
            )
        ),
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

    onChangePermissions = (permissions) => {
        this.setState({ permissions });
    }

    save = () => {
        const {
            id,
            title,
            location,
            start,
            end,
            tags,
            mdtext,
            permissions,
        } = this.state;
        return this.props.save({
            id,
            title,
            location,
            start,
            end,
            tags,
            mdtext,
            permissions: permissions.map((p) => {
                return p.id;
            }),
        });
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
        return (
            <Dialog
                title={this.props.title}
                open={this.props.isOpen}
                onRequestClose={this.props.cancel}
                autoScrollBodyContent
                actions={[
                    <FlatButton
                        onTouchTap={this.props.cancel}
                        label="Avbryt"
                    />,
                    <FlatButton
                        onTouchTap={this.save}
                        label="Lagre"
                        primary
                    />,
                ]}
            >
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
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <DatePicker
                        value={this.state.start}
                        floatingLabelText="Start"
                        onChange={this.onChangeStartDate}
                        style={{
                            flexGrow: '1',
                            minWidth: 260,
                        }}
                    />
                    <TimePicker
                        value={this.state.start}
                        floatingLabelText="Klokkeslett"
                        format="24hr"
                        onChange={this.onChangeStart}
                        style={{
                            flexGrow: '1',
                            minWidth: 260,
                        }}
                    />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <DatePicker
                        value={this.state.end}
                        floatingLabelText="Slutt"
                        onChange={this.onChangeEndDate}
                        style={{
                            flexGrow: '1',
                            minWidth: 260,
                        }}
                    />
                    <TimePicker
                        value={this.state.end}
                        floatingLabelText="Klokkeslett"
                        format="24hr"
                        onChange={this.onChangeEnd}
                        style={{
                            flexGrow: '1',
                            minWidth: 260,
                        }}
                    />
                </div>
                <div>
                    <TextField
                        value={this.state.mdtext}
                        floatingLabelText="Beskrivelse"
                        multiLine
                        fullWidth
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
                    <PermissionField
                        permissions={this.state.permissions}
                        onChange={this.onChangePermissions}
                        groups={this.props.viewer.groups}
                        users={this.props.viewer.friends}
                    />
                </div>
            </Dialog>
        );
    }
}

export default Relay.createContainer(EventForm, {
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
                groups {
                    id
                    name
                }
            }`;
        },
    },
});
