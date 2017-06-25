import PropTypes from 'prop-types';
import React from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'react/lib/update';

import SortableRoleItem from './SortableRoleItem';

@DragDropContext(HTML5Backend)
export default class SortableRoleList extends React.Component {
    static propTypes = {
        roles: PropTypes.array.isRequired,
        onChange: PropTypes.func.isRequired,
    }
    state = {
        roles: this.props.roles,
    }

    onRemoveRole = (role) => {
        const { roles } = this.state;
        roles.splice(role.index, 1);
        this.setState({ roles });
        this.props.onChange(this.state.roles);
    }

    moveRole = (dragIndex, hoverIndex) => {
        const { roles } = this.state;
        const dragRole = roles[dragIndex];

        this.setState(update(this.state, {
            roles: {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, dragRole],
                ],
            },
        }));
        this.props.onChange(this.state.roles);
    }

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
