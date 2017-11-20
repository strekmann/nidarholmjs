import IconButton from 'material-ui/IconButton';
import RemoveCircle from 'material-ui/svg-icons/content/remove-circle';
import DragHandle from 'material-ui/svg-icons/editor/drag-handle';
import PropTypes from 'prop-types';
import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';

const Types = {
    PAGE: 'page',
};

const pageSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
            slug: props.slug,
        };
    },
};

const pageTarget = {
    hover(props, monitor) {
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

@DropTarget(Types.PAGE, pageTarget, (connect) => {
    return {
        connectDropTarget: connect.dropTarget(),
    };
})
@DragSource(Types.PAGE, pageSource, (connect, monitor) => {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    };
})
export default class SortablePageItem extends React.Component {
    static propTypes = {
        connectDragSource: PropTypes.func.isRequired,
        connectDropTarget: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        slug: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        onRemoveSummary: PropTypes.func,
    }

    removeSummary = () => {
        this.props.onRemoveSummary(this.props);
    }

    render() {
        const {
            slug, title, isDragging, connectDragSource, connectDropTarget,
        } = this.props;
        const opacity = isDragging ? 0 : 1;
        const dragIcon = <IconButton onClick={this.removeSummary}><DragHandle /></IconButton>;
        const removeIcon = <IconButton onClick={this.removeSummary}><RemoveCircle /></IconButton>;

        return connectDragSource(connectDropTarget(
            <div
                style={{
                    cursor: 'move', opacity, display: 'flex', alignItems: 'center',
                }}
                className="draggable"
            >
                <div>{dragIcon}</div>
                <div style={{ flexGrow: 1 }}>
                    <div>{title}</div>
                    <div>/{slug}</div>
                </div>
                <div>{removeIcon}</div>
            </div>,
        ));
    }
}
