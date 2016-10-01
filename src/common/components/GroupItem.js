import React from 'react';
import { Link } from 'react-router';

import MemberItem from './MemberItem';

export default class GroupItem extends React.Component {
    static propTypes = {
        name: React.PropTypes.string,
        members: React.PropTypes.array,
    }

    render() {
        return (
            <div>
                <h3><Link>{this.props.name}</Link></h3>
                {this.props.members.map(member => <MemberItem key={member.id} {...member} />)}
            </div>
        );
    }
}
