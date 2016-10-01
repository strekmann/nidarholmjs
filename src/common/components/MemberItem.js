
import React from 'react';
import { Link } from 'react-router';

export default class MemberItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
    }

    render() {
        return (
            <div>
                <Link>{this.props.user.name}</Link>
                <Link to={`mailto:${this.props.user.email}`}>{this.props.user.email}</Link>
                <Link to={`tel:${this.props.user.phone}`}>{this.props.user.phone}</Link>
                <span>{this.props.role.title} {this.props.user.instrument}</span>
            </div>
        );
    }
}
