import React from 'react';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Close from 'material-ui/svg-icons/navigation/close';
import PropTypes from 'prop-types';

export default class PermissionItem extends React.Component {
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
