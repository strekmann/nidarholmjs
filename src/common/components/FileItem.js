import React from 'react';
import { Link } from 'react-router';

export default class EventItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        filename: React.PropTypes.string,
        created: React.PropTypes.string,
        mimetype: React.PropTypes.string,
        size: React.PropTypes.number,
        tags: React.PropTypes.array,
        is_image: React.PropTypes.bool,
    }

    render() {
        return (
            <div>
                <h3><Link>{this.props.filename}</Link></h3>
                {this.props.is_image ? 'Bilde' : 'Fil'}
            </div>
        );
    }
}
