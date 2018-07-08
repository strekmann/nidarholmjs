import PropTypes from "prop-types";
import React from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";

import SortableRoleItem from "./SortableRoleItem";

@DragDropContext(HTML5Backend)
export default class SortableRoleList extends React.Component {
  static propTypes = {
    roles: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  state = {
    roles: this.props.roles,
  };

  componentWillReceiveProps(nextProps) {
    this.state.roles = nextProps.roles;
  }

  onRemoveRole = (role) => {
    const roles = [...this.state.roles];
    roles.splice(role.index, 1);
    this.setState({ roles });
    this.props.onChange(roles);
  };

  moveRole = (dragIndex, hoverIndex) => {
    const dragRole = this.state.roles[dragIndex];
    this.setState(
      update(this.state, {
        roles: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRole]],
        },
      }),
    );
    this.props.onChange(this.state.roles);
  };

  render() {
    const { roles } = this.state;
    return (
      <div>
        {roles.map((role, index) => {
          return (
            <SortableRoleItem
              key={role.id}
              id={role.id}
              index={index}
              name={role.name}
              moveRole={this.moveRole}
              onRemoveRole={this.onRemoveRole}
            />
          );
        })}
      </div>
    );
  }
}
