import areIntlLocalesSupported from 'intl-locales-supported';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import React from 'react';
import Relay from 'react-relay';

import PermissionField from './PermissionField';
import { flattenPermissions } from '../utils';

let DateTimeFormat;
if (areIntlLocalesSupported(['nb'])) {
    DateTimeFormat = global.Intl.DateTimeFormat;
}

class ProjectForm extends React.Component {
    static propTypes = {
        open: React.PropTypes.bool,
        save: React.PropTypes.func,
        toggle: React.PropTypes.func,
        viewer: React.PropTypes.object,
        id: React.PropTypes.string,
        title: React.PropTypes.string,
        tag: React.PropTypes.string,
        privateMdtext: React.PropTypes.string,
        publicMdtext: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        permissions: React.PropTypes.object,
    }

    state = {
        title: this.props.title || '',
        tag: this.props.tag || '',
        privateMdtext: this.props.privateMdtext || '',
        publicMdtext: this.props.publicMdtext || '',
        start: this.props.start ? moment(this.props.start).toDate() : null,
        end: this.props.end ? moment(this.props.end).toDate() : null,
        permissions: this.props.permissions ? flattenPermissions(this.props.permissions) : [],
    };

    onChangeTitle = (event, title) => {
        this.setState({ title });
    }

    onChangeTag = (event, tag) => {
        this.setState({ tag });
    }

    onChangePrivateMdtext = (event, privateMdtext) => {
        this.setState({ privateMdtext });
    }

    onChangePublicMdtext = (event, publicMdtext) => {
        this.setState({ publicMdtext });
    }

    onChangeStart = (event, start) => {
        this.setState({ start });
    }

    onChangeEnd = (event, end) => {
        this.setState({ end });
    }

    onPermissionChange = (permissions) => {
        this.setState({ permissions });
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
        const permissions = this.state.permissions.filter(_p => _p.value !== permissionId);
        this.setState({
            permissions,
        });
    }

    toggle = () => {
        this.props.toggle();
    }

    saveProject = (event) => {
        event.preventDefault();
        this.props.toggle();
        this.props.save({
            id: this.props.id,
            title: this.state.title,
            tag: this.state.tag,
            privateMdtext: this.state.privateMdtext,
            publicMdtext: this.state.publicMdtext,
            start: this.state.start,
            end: this.state.end,
            permissions: this.state.permissions.map(p => p.id),
        }, {
            onSuccess: () => {
                if (!this.props.id) {
                    this.setState({
                        title: '',
                        tag: '',
                        privateMdtext: '',
                        publicMdtext: '',
                        start: null,
                        end: null,
                        permissions: [],
                    });
                }
            },
        });
    }

    render() {
        const viewer = this.props.viewer;
        const permissions = [];
        if (viewer) {
            permissions.push({ value: 'p', text: 'Verden' });
            viewer.groups.forEach(group => {
                permissions.push({ value: group.id, text: group.name });
            });
        }

        return (
            <Dialog
                title={this.props.id ? 'Rediger prosjekt' : 'Nytt prosjekt'}
                open={this.props.open}
                onRequestClose={this.toggle}
                autoScrollBodyContent
            >
                <form onSubmit={this.saveProject}>
                    <div>
                        <TextField
                            floatingLabelText="Tittel"
                            onChange={this.onChangeTitle}
                            value={this.state.title}
                            required
                        />
                    </div>
                    <div>
                        <TextField
                            floatingLabelText="Identifikator"
                            onChange={this.onChangeTag}
                            value={this.state.tag}
                            required
                        />
                    </div>
                    <div>
                        <TextField
                            floatingLabelText="Intern beskrivelse"
                            onChange={this.onChangePrivateMdtext}
                            value={this.state.privateMdtext}
                            multiLine
                            fullWidth
                        />
                    </div>
                    <div>
                        <TextField
                            floatingLabelText="Ekstern beskrivelse"
                            onChange={this.onChangePublicMdtext}
                            value={this.state.publicMdtext}
                            multiLine
                            fullWidth
                        />
                    </div>
                    <div>
                        <DatePicker
                            id="start"
                            floatingLabelText="Prosjektstart"
                            onChange={this.onChangeStart}
                            value={this.state.start}
                            mode="landscape"
                            locale="nb"
                            DateTimeFormat={DateTimeFormat}
                        />
                    </div>
                    <div>
                        <DatePicker
                            id="end"
                            floatingLabelText="Prosjektslutt"
                            onChange={this.onChangeEnd}
                            value={this.state.end}
                            mode="landscape"
                            locale="nb"
                            DateTimeFormat={DateTimeFormat}
                            required
                        />
                    </div>
                    <div>
                        <PermissionField
                            permissions={this.state.permissions}
                            onChange={this.onPermissionChange}
                            groups={this.props.viewer.groups}
                            users={this.props.viewer.friends}
                        />
                    </div>
                    <div>
                        <RaisedButton
                            type="submit"
                            label="Lagre"
                            primary
                        />
                        <RaisedButton
                            type="reset"
                            label="Avbryt"
                            onClick={this.toggle}
                        />
                    </div>
                </form>
            </Dialog>
        );
    }
}

export default Relay.createContainer(ProjectForm, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
            groups {
                id
                name
            }
        }`,
    },
});
