/* @flow */

import * as React from 'react';

import PermissionChipItem from './PermissionChipItem';

type Props = {
    permissions: Array<{
        id: string,
        name: string,
    }>,
    memberGroupId?: string,
    removePermission?: (string) => void,
}

export default class PermissionChips extends React.Component<Props> {
    removePermission = (id: string) => {
        if (typeof this.props.removePermission === 'function') {
            this.props.removePermission(id);
        }
    }
    render() {
        let { permissions } = this.props;
        if (!permissions.length) {
            permissions = [{ id: null, name: 'Bare meg' }];
        }
        const chips = permissions.map((permission) => {
            return (
                <PermissionChipItem
                    id={permission.id}
                    key={permission.id}
                    memberGroupId={this.props.memberGroupId}
                    removePermission={this.removePermission}
                    text={permission.name}
                />
            );
        });
        return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{chips}</div>;
    }
}
