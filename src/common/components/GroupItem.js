import Divider from 'material-ui/Divider';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import MemberItem from './MemberItem';

class GroupItem extends React.Component {
    static propTypes = {
        group: React.PropTypes.object,
        isAdmin: React.PropTypes.bool,
        isMember: React.PropTypes.bool,
    }

    renderHeader() {
        const {
            id,
            name,
        } = this.props.group;
        if (this.props.isAdmin) {
            return <Subheader style={{ textTransform: 'uppercase' }}><Link to={`/group/${id}`}>{name}</Link></Subheader>;
        }
        return <Subheader style={{ textTransform: 'uppercase' }}>{name}</Subheader>;
    }

    render() {
        const members = this.props.group.members.filter((member) => {
            return member.user;
        });
        if (!members.length) {
            return null;
        }
        return (
            <List>
                <Divider />
                {this.renderHeader()}
                {members.sort((a, b) => {
                    return a.user.name > b.user.name;
                }).map((member) => {
                    return (
                        <MemberItem
                            key={member.id}
                            isMember={this.props.isMember}
                            member={member}
                        />
                    );
                })}
            </List>
        );
    }
}

export default Relay.createContainer(GroupItem, {
    fragments: {
        group: () => {
            return Relay.QL`
            fragment on Group {
                id
                name
                members {
                    id
                    user(active:true) {
                        id
                    }
                    ${MemberItem.getFragment('member')}
                }
            }`;
        },
    },
});
