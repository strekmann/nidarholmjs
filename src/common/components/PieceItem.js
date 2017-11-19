import React from 'react';
import Link from 'found/lib/Link';
import { TableRow, TableRowColumn } from 'material-ui/Table';

import List from './List';

export default class ProjectItem extends React.Component {
    render() {
        const piece = this.props;
        return (
            <TableRow>
                <TableRowColumn>{piece.scoreCount}</TableRowColumn>
                <TableRowColumn>
                    <Link to={`/music/${piece.id}`}>
                        {piece.title} <small>{piece.subtitle}</small>
                    </Link>
                </TableRowColumn>
                <TableRowColumn>
                    <List items={piece.composers} /> <small><List items={piece.arrangers} /></small>
                </TableRowColumn>
            </TableRow>
        );
    }
}
