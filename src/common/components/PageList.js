import PropTypes from 'prop-types';
import React from 'react';

import PageItem from './PageItem';

export default class PageList extends React.Component {
    static propTypes = {
        memberGroupId: PropTypes.string,
        pages: PropTypes.object,
    }
    render() {
        return (
            <div>
                {this.props.pages.edges.map((edge) => {
                    return (
                        <PageItem
                            key={edge.node.id}
                            memberGroupId={this.props.memberGroupId}
                            {...edge.node}
                        />
                    );
                })}
            </div>
        );
    }
}
