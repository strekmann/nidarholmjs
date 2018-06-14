/* @flow */

import Link from 'found/lib/Link';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import * as React from 'react';

import List from './List';

type Props = {
    id: string,
    title: string,
    subtitle: string,
    scoreCount: number,
    arrangers: Array<string>,
    composers: Array<string>,
}

export default class ProjectItem extends React.Component<Props> {
    render() {
        const {
            id,
            scoreCount,
            title,
            subtitle,
            composers,
            arrangers,
        } = this.props;
        return (
            <TableRow>
                <TableRowColumn>{scoreCount}</TableRowColumn>
                <TableRowColumn>
                    <Link to={`/music/${id}`}>
                        {title} <small>{subtitle}</small>
                    </Link>
                </TableRowColumn>
                <TableRowColumn>
                    <List items={composers} /> <small><List items={arrangers} /></small>
                </TableRowColumn>
            </TableRow>
        );
    }
}
