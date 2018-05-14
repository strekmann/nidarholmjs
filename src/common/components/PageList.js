/* @flow */

import * as React from 'react';

import PageItem from './PageItem';

type Props = {
    memberGroupId: string,
    pages: {
        edges: Array<{
            node: {
                id: string,
                created: string,
                creator: {
                    name: string,
                },
                permissions: Array<{}>,
                slug: string,
                title: string,
                updated: string,
                updator: {
                    name: string,
                },
            },
        }>,
    },
}

export default class PageList extends React.Component<Props> {
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
