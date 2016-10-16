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
        permissions: React.PropTypes.array,
        public: React.PropTypes.bool,
        groups: React.PropTypes.array,
        users: React.PropTypes.array,
        memberGroupId: React.PropTypes.string,
    }
    render() {
        let permissions = this.props.permissions.map(permission => {
            if (permission.id === 'p') {
                return (
                    <Chip key="public">
                        <Avatar backgroundColor={blue500} icon={<Public />} />
                        Verden
                    </Chip>
                );
            }
            let icon = null;
            if (permission.id === this.props.memberGroupId) {
                icon = <Avatar backgroundColor={lightBlue500} icon={<Group />} />;
            }
            return <Chip key={permission.id}>{icon}{permission.name}</Chip>;
        });

        if (!permissions.length) {
            permissions = [
                <Chip key="null">
                    <Avatar backgroundColor={red500} icon={<VisibilityOff />} />
                    Bare meg
                </Chip>,
            ];
        }
        return <div style={{ display: 'flex' }}>{permissions}</div>;
    }
}
