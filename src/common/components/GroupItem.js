import React from 'react';
import { Link } from 'react-router';

import MemberItem from './MemberItem';

export default class GroupItem extends React.Component {
    static propTypes = {
        isMember: React.PropTypes.bool,
        name: React.PropTypes.string,
        members: React.PropTypes.array,
    }

    render() {
        if (!this.props.members.filter(member => member.user).length) {
            return null;
        }
        return (
            <div>
                <h2>{this.props.name}</h2>
                {this.props.members.map(member => <MemberItem
                    key={member.id}
                    isMember={this.props.isMember}
                    {...member}
                />)}
            </div>
        );
    }
}
