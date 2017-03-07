import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
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
            return <Subheader style={{ textTransform: 'uppercase' }}><Link to={`/group/${this.props.id}`}>{this.props.name}</Link></Subheader>;
        }
        return <Subheader style={{ textTransform: 'uppercase' }}>{this.props.name}</Subheader>;
    }

    render() {
        const members = this.props.members.filter((member) => {
            return member.user;
        });
        if (!members.length) {
            return null;
        }
        return (
            <List>
                {this.renderHeader()}
                {members.sort((a, b) => {
                    return a.user.name > b.user.name;
                }).map((member) => {
                    return (
                        <MemberItem
                            key={member.id}
                            isMember={this.props.isMember}
                            {...member}
                        />
                    );
                })}
            </List>
        );
    }
}
