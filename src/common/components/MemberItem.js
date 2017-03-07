import { ListItem } from 'material-ui/List';
import React from 'react';
import { Link } from 'react-router';

import Phone from './Phone';

export default class MemberItem extends React.Component {
    static propTypes = {
        isMember: React.PropTypes.bool,
        user: React.PropTypes.object,
        role: React.PropTypes.object,
    }

    render() {
        if (this.props.user) {
            const user = this.props.user;
            return (
                <div>
                    {this.props.isMember
                        ? <ListItem
                            disabled
                            primaryText={
                                <div>
                                    <Link to={`/users/${user.id}`}>{user.name}</Link>
                                    {' '}
                                    {this.props.role.tile || user.instrument
                                        ? <span>({this.props.role.title || user.instrument})</span>
                                        : null
                                    }
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
                            primaryText={
                                <div>
                                    {user.name}
                                    {' '}
                                    {this.props.role.tile || user.instrument
                                        ? <span>({this.props.role.title || user.instrument})</span>
                                        : null
                                    }
                                </div>
                            }
                        />
                    }
                </div>
            );
        }
        return null;
    }
}
