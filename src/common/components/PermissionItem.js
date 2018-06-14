/* @flow */

import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Close from 'material-ui/svg-icons/navigation/close';
import PropTypes from 'prop-types';
import * as React from 'react';

type Props = {
    name: string,
    id: string,
    removePermission: (string) => void,
}

export default class PermissionItem extends React.Component<Props> {
    static propTypes = {
        name: PropTypes.string,
        id: PropTypes.string,
        removePermission: PropTypes.func,
    }
    removePermission = () => {
        this.props.removePermission(this.props.id);
    }
    render() {
        return (
            <ListItem
                primaryText={this.props.name}
                rightIconButton={
                    <IconButton onClick={this.removePermission}>
                        <Close />
                    </IconButton>
                }
            />
        );
    }
}
