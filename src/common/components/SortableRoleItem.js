// @flow

import IconButton from "material-ui/IconButton";
import RemoveCircle from "material-ui/svg-icons/content/remove-circle";
import DragHandle from "material-ui/svg-icons/editor/drag-handle";
import React from "react";
import { DragSource, DropTarget } from "react-dnd";

const Types = {
  ROLE: "role",
};

const roleSource = {
  beginDrag(props) {
    return {
      id: props.id,
      index: props.index,
      name: props.name,
    };
  },
};

const roleTarget = {
  hover(props, monitor) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    props.moveRole(dragIndex, hoverIndex);
    monitor.getItem().index = hoverIndex;
  },
};

type Props = {
  connectDragSource: (any) => void,
  connectDropTarget: (any) => void,
  isDragging: boolean,
  name: string,
  onRemoveRole: (Props) => void,
};

@DropTarget(Types.ROLE, roleTarget, (connect) => {
  return {
    connectDropTarget: connect.dropTarget(),
  };
})
@DragSource(Types.ROLE, roleSource, (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
})
export default class SortableRoleItem extends React.Component<Props> {
  removeRole = () => {
    const { onRemoveRole } = this.props;
    onRemoveRole(this.props);
  };

  render() {
    const {
      name,
      isDragging,
      connectDragSource,
      connectDropTarget,
    } = this.props;
    const opacity = isDragging ? 0 : 1;
    const dragIcon = (
      <IconButton onClick={this.removeRole}>
        <DragHandle />
      </IconButton>
    );
    const removeIcon = (
      <IconButton onClick={this.removeRole}>
        <RemoveCircle />
      </IconButton>
    );
    const element = (
      <div
        style={{
          cursor: "move",
          opacity,
          display: "flex",
          alignItems: "center",
        }}
        className="draggable"
      >
        <div>{dragIcon}</div>
        <div style={{ flexGrow: 1 }}>
          <div>{name}</div>
        </div>
        <div>{removeIcon}</div>
      </div>
    );

    return connectDragSource(connectDropTarget(element));
  }
}
