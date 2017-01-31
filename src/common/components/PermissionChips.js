import React from 'react';
import PermissionChipItem from './PermissionChipItem';

export default class PermissionChips extends React.Component {
    static propTypes = {
        permissions: React.PropTypes.array,
        groups: React.PropTypes.array,
        users: React.PropTypes.array,
        memberGroupId: React.PropTypes.string,
        removePermission: React.PropTypes.func,
    }
    removePermission = (id) => {
        this.props.removePermission(id);
    }
    render() {
        let permissions = this.props.permissions;
        if (!permissions.length) {
            permissions = [{ id: null, name: 'Bare meg' }];
        }
        const chips = permissions.map(permission => <PermissionChipItem
            id={permission.id}
            key={permission.id}
            memberGroupId={this.props.memberGroupId}
            removePermission={this.props.removePermission ? this.removePermission : null}
            text={permission.name}
        />);
        return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{chips}</div>;
    }
}
