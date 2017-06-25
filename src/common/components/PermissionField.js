import PropTypes from 'prop-types';
import React from 'react';
import AutoComplete from 'material-ui/AutoComplete';

import PermissionChips from './PermissionChips';

export default class PermissionField extends React.Component {
    static propTypes = {
        permissions: PropTypes.array,
        groups: PropTypes.array,
        users: PropTypes.array,
        onChange: PropTypes.func,
        memberGroupId: PropTypes.string,
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
        const permissions = this.state.permissions.filter((_p) => {
            return _p.id !== permissionId;
        });
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
        groups.forEach((group) => {
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
