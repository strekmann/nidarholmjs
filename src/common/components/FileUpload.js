import React from 'react';
import Dropzone from 'react-dropzone';

import AutoComplete from 'material-ui/AutoComplete';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';

import PermissionItem from './PermissionItem';

export default class FileUpload extends React.Component {
    static propTypes = {
        viewer: React.PropTypes.object,
        onDrop: React.PropTypes.func,
        organization: React.PropTypes.object,
    }

    state = {
        permissions: [],
        permission: '',
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
        const permissions = this.state.permissions.filter(_p => _p.value !== permissionId);
        this.setState({
            permissions,
        });
    }

    onDrop = (files) => {
        const permissions = this.state.permissions.map(permission => permission.value);
        this.props.onDrop(files, permissions);
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
            <Paper>
                {this.state.permissions.length ?
                    <div>
                        <List>
                            <Subheader>Rettigheter</Subheader>
                            {
                                this.state.permissions.map(
                                    permission => <PermissionItem
                                        key={permission.value}
                                        removePermission={this.removePermission}
                                        {...permission}
                                    />
                                    )
                            }
                        </List>
                    </div>
                : null}

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
                <Dropzone onDrop={this.onDrop} />
            </Paper>
        );
    }
}
