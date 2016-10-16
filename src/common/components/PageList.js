import React from 'react';

import PageItem from './PageItem';

export default class PageList extends React.Component {
    static propTypes = {
        pages: React.PropTypes.object,
        savePage: React.PropTypes.func,
    }
    render() {
        return (
            <div>
                {this.props.pages.edges.map(
                    edge => <PageItem key={edge.node.id} {...edge.node} />
                    )}
            </div>
        );
    }
}
