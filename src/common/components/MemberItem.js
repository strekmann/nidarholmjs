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
                <div style={{ marginBottom: 5 }}>
                    {this.props.isMember
                        ? <div>
                            <Link to={`/users/${user.username}`}>{user.name}</Link>
                            {' '}
                            {this.props.role.tile || user.instrument
                                ? <span>({this.props.role.title || user.instrument})</span>
                                : null
                            }
                            <div>
                                <Phone phone={user.phone} /> -
                                {' '}
                                <Link
                                    to={`mailto:${user.email}`}
                                >
                                    {user.email}
                                </Link>
                            </div>
                        </div>
                        : <div>
                            {user.name}
                            {' '}
                            {this.props.role.tile || user.instrument
                                ? <span>({this.props.role.title || user.instrument})</span>
                                : null
                            }
                        </div>
                    }
                </div>
            );
        }
        return null;
    }
}
