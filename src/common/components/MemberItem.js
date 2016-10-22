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
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem',
                        }}
                    >
                        <div>
                            <Link to={`/users/${user.username}`}>{user.name}</Link><br />
                            {this.props.isMember
                                ? <div>
                                    <Link
                                        to={`mailto:${user.email}`}
                                    >
                                        {user.email}
                                    </Link> - <Phone phone={user.phone} />
                                </div>
                                : null
                            }
                        </div>
                        <div>
                            <span>{this.props.role.title} {user.instrument}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }
}
