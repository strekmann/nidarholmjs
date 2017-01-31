import React from 'react';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Close from 'material-ui/svg-icons/navigation/close';

export default class TagItem extends React.Component {
    static propTypes = {
        removeTag: React.PropTypes.func,
        tag: React.PropTypes.string,
    }
    removeTag = () => {
        this.props.removeTag(this.props.tag);
    }
    render() {
        return (
            <ListItem
                primaryText={this.props.tag}
                rightIconButton={
                    <IconButton onClick={this.removeTag}>
                        <Close />
                    </IconButton>
                    }
            />
        );
    }
}
