import React from 'react';
import { Link } from 'react-router';

export default class PageItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        slug: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        title: React.PropTypes.string,
        summary: React.PropTypes.string,
        savePage: React.PropTypes.func,
    }

    render() {
        return (
            <div>
                <h3><Link to={`/${this.props.slug}`}>{this.props.slug}</Link></h3>
            </div>
        );
    }
}
