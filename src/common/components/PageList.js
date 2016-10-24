import React from 'react';

import PageItem from './PageItem';

export default class PageList extends React.Component {
    static propTypes = {
        memberGroupId: React.PropTypes.string,
        pages: React.PropTypes.object,
        savePage: React.PropTypes.func,
        isAdmin: React.PropTypes.bool,
    }
    render() {
        return (
            <div>
                {this.props.pages.edges.map(
                    edge => <PageItem
                        key={edge.node.id}
                        memberGroupId={this.props.memberGroupId}
                        {...edge.node}
                    />
                    )
                }
            </div>
        );
    }
}
