// @flow

import React from "react";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import update from "immutability-helper";

import SortableRoleItem from "./SortableRoleItem";

export type Role = {
  id: string,
  name: string,
};

type Props = {
  roles: Array<Role>,
  onChange: (Array<Role>) => void,
};

type State = {
  roles: Array<Role>,
};

@DragDropContext(HTML5Backend)
export default class SortableRoleList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { roles } = props;
    this.state = {
      roles: [...roles],
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    this.state.roles = nextProps.roles;
  }

  onRemoveRole = (role: Role) => {
    const { onChange } = this.props;
    const { roles } = this.state;
    const copiedRoles = [...roles];
    copiedRoles.splice(role.index, 1);
    this.setState({ roles: copiedRoles });
    onChange(copiedRoles);
  };

  moveRole = (dragIndex: number, hoverIndex: number) => {
    const { onChange } = this.props;
    const { roles } = this.state;
    const dragRole = roles[dragIndex];
    this.setState(
      update(this.state, {
        roles: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragRole]],
        },
      }),
    );
    onChange(roles);
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
