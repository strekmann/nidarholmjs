import React from 'react';

import AutoComplete from 'material-ui/AutoComplete';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';

import PermissionItem from './PermissionItem';
import PermissionChips from './PermissionChips';

export default class PermissionField extends React.Component {
    static propTypes = {
        permissions: React.PropTypes.array,
        groups: React.PropTypes.array,
        users: React.PropTypes.array,
        onChange: React.PropTypes.func,
        memberGroupId: React.PropTypes.string,
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

    addPermission = (chosen) => {
        const permissions = this.state.permissions;
        permissions.push(chosen);
        this.setState({
            permissions,
            permission: '',
        });
        this.props.onChange(permissions);
    }

    removePermission = (permissionId) => {
        const permissions = this.state.permissions.filter(_p => _p.id !== permissionId);
        this.setState({
            permissions,
        });
        this.props.onChange(permissions);
    }

    render() {
        const permissions = [];
        const groups = this.props.groups || [];
        // const users = this.props.users || [];
        permissions.push({ id: 'p', name: 'Verden' });
        groups.forEach(group => {
            permissions.push({ id: group.id, name: group.name });
        });
        /*
        users.forEach(user => {
            permissions.push({ id: user.id, name: user.name });
        });
        */
        return (
            <div>
                <AutoComplete
                    id="permissions"
                    floatingLabelText="Legg til rettigheter"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={permissions}
                    dataSourceConfig={{ text: 'name', value: 'id' }}
                    maxSearchResults={8}
                    searchText={this.state.permission}
                    onNewRequest={this.addPermission}
                    onUpdateInput={this.onPermissionChange}
                />
                <PermissionChips
                    permissions={this.state.permissions}
                    groups={this.props.groups}
                    users={this.props.users}
                    memberGroupId={this.props.memberGroupId}
                    removePermission={this.removePermission}
                />
            </div>
        );
    }
}
