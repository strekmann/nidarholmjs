import { ListItem } from 'material-ui/List';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import Phone from './Phone';

class MemberItem extends React.Component {
    static propTypes = {
        isMember: React.PropTypes.bool,
        member: React.PropTypes.object,
    }

    render() {
        const {
            user,
            roles,
        } = this.props.member;
        if (user) {
            return (
                <div>
                    {this.props.isMember
                        ? <ListItem
                            disabled
                            primaryText={
                                <div>
                                    <Link to={`/users/${user.id}`}>{user.name}</Link>
                                    {roles.map((role) => {
                                        return (
                                            <div>
                                                {' '}
                                                {role.name || user.instrument
                                                    ? <span>({role.name || user.instrument})</span>
                                                    : null
                                                }
                                            </div>
                                        );
                                    })}
                                </div>
                            }
                            secondaryText={
                                <div>
                                    <Phone phone={user.phone} />
                                    {user.phone && user.email
                                        ? ' – '
                                        : null
                                    }
                                    <a
                                        href={`mailto:${user.email}`}
                                    >
                                        {user.email}
                                    </a>
                                </div>
                            }
                        />
                        : <ListItem
                            primaryText={roles.map((role) => {
                                return (
                                    <div>
                                        {user.name}
                                        {' '}
                                        {role.name || user.instrument
                                            ? <span>({role.name || user.instrument})</span>
                                            : null
                                        }
                                    </div>
                                );
                            })}
                        />
                    }
                </div>
            );
        }
        return null;
    }
}

export default Relay.createContainer(MemberItem, {
    fragments: {
        member: () => {
            return Relay.QL`
            fragment on Member {
                id
                user(active:true) {
                    id
                    name
                    username
                    email
                    phone
                    membershipStatus
                    instrument
                }
                roles {
                    id
                    name
                    email
                }
            }`;
        },
    },
});
