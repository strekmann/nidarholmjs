import React from 'react';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Close from 'material-ui/svg-icons/navigation/close';

export default class PermissionItem extends React.Component {
    static propTypes = {
        name: React.PropTypes.string,
        id: React.PropTypes.string,
        removePermission: React.PropTypes.func,
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
