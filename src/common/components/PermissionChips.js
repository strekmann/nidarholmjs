import React from 'react';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import Public from 'material-ui/svg-icons/social/public';
import Group from 'material-ui/svg-icons/social/group';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import { red500, blue500, lightBlue500 } from 'material-ui/styles/colors';

export default class PermissionChips extends React.Component {
    static propTypes = {
        public: React.PropTypes.bool,
        groups: React.PropTypes.array,
        users: React.PropTypes.array,
        memberGroupId: React.PropTypes.string,
    }
    render() {
        const pub = this.props.public;
        const groups = this.props.groups;
        const users = this.props.users;
        const permissions = [];
        if (pub) {
            permissions.push(
                <Chip key="public">
                    <Avatar backgroundColor={blue500} icon={<Public />} />
                    Verden
                </Chip>
            );
        }
        groups.forEach(group => {
            let icon = null;
            if (group.id === this.props.memberGroupId) {
                icon = <Avatar backgroundColor={lightBlue500} icon={<Group />} />;
            }
            permissions.push(<Chip key={group.id}>{icon}{group.name}</Chip>);
        });
        users.forEach(user => {
            permissions.push(<Chip key={user.id}>{user.name}</Chip>);
        });
        if (!permissions.length) {
            permissions.push(
                <Chip key="null">
                    <Avatar backgroundColor={red500} icon={<VisibilityOff />} />
                    Bare meg
                </Chip>
            );
        }
        return <div>{permissions}</div>;
    }
}
