import React from 'react';
import { Link } from 'react-router';

import Phone from './Phone';

export default class MemberItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
    }

    render() {
        if (this.props.user) {
            return (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <div>
                            <Link>{this.props.user.name}</Link><br />
                            <Link to={`mailto:${this.props.user.email}`}>{this.props.user.email}</Link> - <Phone phone={this.props.user.phone} />
                        </div>
                        <div>
                            <span>{this.props.role.title} {this.props.user.instrument}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }
}
