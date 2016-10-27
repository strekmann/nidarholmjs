import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import DragHandle from 'material-ui/svg-icons/editor/drag-handle';
import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';

const Types = {
    PAGE: 'page',
};

const pageSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
            slug: props.slug,
            title: props.title,
        };
    },
};

const pageTarget = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) {
            return;
        }

        props.movePage(dragIndex, hoverIndex);
        monitor.getItem().index = hoverIndex;
    },
};

@DropTarget(Types.PAGE, pageTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))
@DragSource(Types.PAGE, pageSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
}))
export default class SortablePageItem extends React.Component {
    static propTypes = {
        connectDragPreview: React.PropTypes.func.isRequired,
        connectDragSource: React.PropTypes.func.isRequired,
        connectDropTarget: React.PropTypes.func.isRequired,
        index: React.PropTypes.number.isRequired,
        isDragging: React.PropTypes.bool.isRequired,
        id: React.PropTypes.any.isRequired,
        slug: React.PropTypes.string.isRequired,
        title: React.PropTypes.string,
        movePage: React.PropTypes.func.isRequired,
        onRemoveSummary: React.PropTypes.func,
    }

    removeSummary = () => {
        this.props.onRemoveSummary(this.props);
    }

    render() {
        const { slug, title, isDragging, connectDragPreview, connectDragSource, connectDropTarget, ...rest } = this.props;
        const opacity = isDragging ? 0 : 1;
        const remove = <IconButton onClick={this.removeSummary}><RemoveCircle /></IconButton>;

        return (
            <ListItem
                style={{ cursor: 'move', opacity }}
                primaryText={title}
                secondaryText={slug}
                ref={
                    instance => {
                        const node = findDOMNode(instance);
                        //console.log(instance, node);
                        connectDragSource(node);
                        connectDropTarget(node);
                        connectDragPreview(node);
                    }
                }
                rightIconButton={remove}
                leftIcon={<DragHandle />}
            />
        );
    }
}
