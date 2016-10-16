import React from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import PermissionItem from './PermissionItem';

export default class PermissionField extends React.Component {
    static propTypes = {
        permissions: React.PropTypes.array,
        groups: React.PropTypes.array,
        users: React.PropTypes.array,
    }

    state = {
        permissions: this.props.permissions || [],
        permission: '',
    }

    onPermissionChange = (value) => {
        this.setState({
            permission: value,
        });
    }

    getValue = () => this.state.permissions.map(permission => permission.value);

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

    render() {
        const permissions = [];
        const groups = this.props.groups || [];
        const users = this.props.users || [];
        permissions.push({ value: 'p', text: 'Verden' });
        groups.forEach(group => {
            permissions.push({ value: group.id, text: group.name });
        });
        users.forEach(user => {
            permissions.push({ value: user.id, text: user.name });
        });
        return (
            <div>
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
        );
    }
}
