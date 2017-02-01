import React from 'react';
import { Link } from 'react-router';

import MemberItem from './MemberItem';

export default class GroupItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        isAdmin: React.PropTypes.bool,
        isMember: React.PropTypes.bool,
        name: React.PropTypes.string,
        members: React.PropTypes.array,
    }

    renderHeader() {
        if (this.props.isAdmin) {
            return <h2><Link to={`/group/${this.props.id}`}>{this.props.name}</Link></h2>;
        }
        return <h2>{this.props.name}</h2>;
    }

    render() {
        const members = this.props.members.filter(member => member.user);
        if (!members.length) {
            return null;
        }
        return (
            <div>
                {this.renderHeader()}
                {members.sort((a, b) => a.user.name > b.user.name).map(member => <MemberItem
                    key={member.id}
                    isMember={this.props.isMember}
                    {...member}
                />)}
            </div>
        );
    }
}
