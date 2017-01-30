import Paper from 'material-ui/Paper';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Relay from 'react-relay';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import PieceItem from './PieceItem';
import theme from '../theme';

const itemsPerPage = 50;

class Pieces extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
        relay: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        term: '',
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onSearchChange = (event, term) => {
        this.setState({
            term,
        });
    }

    onSearch = (event) => {
        event.preventDefault();
        this.props.relay.setVariables({
            term: this.state.term,
        });
    }

    loadMore = () => {
        const pieces = this.props.organization.pieces;
        this.props.relay.setVariables({
            showItems: pieces.edges.length + itemsPerPage,
        });
    }

    render() {
        const org = this.props.organization;
        const pieces = org.pieces;
        return (
            <Paper className="row">
                <h1>Notearkivet</h1>
                <form onSubmit={this.onSearch} style={{ marginBottom: '2em' }}>
                    <TextField
                        id="term"
                        floatingLabelText="Tittel"
                        value={this.state.term}
                        onChange={this.onSearchChange}
                    />
                    <RaisedButton
                        label="Søk"
                        type="submit"
                        primary
                    />
                </form>
                <Table>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Digitale stemmer</TableHeaderColumn>
                            <TableHeaderColumn>Tittel</TableHeaderColumn>
                            <TableHeaderColumn>Komponist (Arrangør)</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pieces.edges.map(edge => <PieceItem key={edge.node.id} {...edge.node} />)}
                    </TableBody>
                </Table>
                {pieces.pageInfo.hasNextPage ?
                    <RaisedButton primary onClick={this.loadMore}>Mer</RaisedButton>
                    :
                    null
                }
            </Paper>
        );
    }
}

export default Relay.createContainer(Pieces, {
    initialVariables: {
        showItems: itemsPerPage,
        term: '',
    },
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            id
            memberGroup {
                id
            }
            pieces(first:$showItems,term:$term) {
                edges {
                    node {
                        id
                        title
                        subtitle
                        composers
                        arrangers
                        scoreCount
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    },
});
