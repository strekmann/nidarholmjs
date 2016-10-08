import React from 'react';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Close from 'material-ui/svg-icons/navigation/close';

export default class PermissionItem extends React.Component {
    static propTypes = {
        text: React.PropTypes.string,
        value: React.PropTypes.string,
        removePermission: React.PropTypes.func,
    }
    removePermission = () => {
        this.props.removePermission(this.props.value);
    }
    render() {
        return (
            <ListItem
                primaryText={this.props.text}
                rightIconButton={
                    <IconButton onClick={this.removePermission}>
                        <Close />
                    </IconButton>
                    }
            />
        );
    }
}
