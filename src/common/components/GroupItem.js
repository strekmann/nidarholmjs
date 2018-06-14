/* @flow */

import Link from 'found/lib/Link';
import Divider from 'material-ui/Divider';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import MemberItem from './MemberItem';

type Props = {
    group: {
        id: string,
        name: string,
        members: Array<{
            id: string,
            user: {
                name: string,
            },
        }>,
    },
    isAdmin: boolean,
    isMember: boolean,
}

class GroupItem extends React.Component<Props> {
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
        members.sort((a, b) => {
            if (a.user.name > b.user.name) {
                return 1;
            }
            return -1;
        });
        return (
            <List>
                <Divider />
                {this.renderHeader()}
                {members.map((member) => {
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

export default createFragmentContainer(
    GroupItem,
    {
        group: graphql`
        fragment GroupItem_group on Group {
            id
            name
            members {
                id
                user(active:true) {
                    id
                    name
                }
                ...MemberItem_member
            }
        }`,
    },
);
