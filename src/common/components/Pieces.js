import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableHeader, TableBody, TableRow, TableHeaderColumn } from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
import CreatePieceMutation from '../mutations/createPiece';

import PieceForm from './PieceForm';
import PieceItem from './PieceItem';

const itemsPerPage = 50;

class Pieces extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object.isRequired,
        relay: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        addPiece: false,
        newPiece: false,
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

    onClear = () => {
        this.setState({
            term: '',
        });
        this.props.relay.setVariables({
            term: '',
        });
    }

    handleClickNewPiece = () => {
        this.setState({ newPiece: true });
    }

    savePiece = (piece) => {
        this.setState({ addPiece: false });
        const {
            composers,
            arrangers,
            title,
            subtitle,
        } = piece;
        this.context.relay.commitUpdate(new CreatePieceMutation({
            composers: composers.split(','),
            arrangers: arrangers.split(','),
            title,
            subtitle,
            organization: this.props.organization,
        }));
    }

    closeAddPiece = () => {
        this.setState({ addPiece: false });
    }

    loadMore = () => {
        const pieces = this.props.organization.pieces;
        this.props.relay.setVariables({
            showItems: pieces.edges.length + itemsPerPage,
        });
    }

    search = (term) => {
        // both chaning state.term and running search
        // this.setState({ term });
        this.props.relay.setVariables({ term });
    }

    render() {
        const org = this.props.organization;
        const pieces = org.pieces;
        const isMusicAdmin = org.isMusicAdmin;
        const { desktopGutterLess } = theme.spacing;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Notearkivet</h1>
                    {isMusicAdmin
                        ? <PieceForm
                            title="Nytt stykke"
                            isOpen={this.state.addPiece}
                            save={this.savePiece}
                            cancel={this.closeAddPiece}
                            pieces={this.props.organization.pieces}
                            search={this.search}
                            searching
                        />
                        : null
                    }
                    <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
                        <ToolbarGroup lastChild>
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                {isMusicAdmin
                                        ? <MenuItem
                                            primaryText="Nytt stykke"
                                            onTouchTap={() => {
                                                this.setState({ addPiece: !this.state.addPiece });
                                            }}
                                        />
                                        : null
                                }
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                </div>
                <form onSubmit={this.onSearch} style={{ marginBottom: desktopGutterLess }}>
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
                    <RaisedButton
                        label="Tøm"
                        type="reset"
                        onTouchTap={this.onClear}
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
                        {pieces.edges.map((edge) => {
                            return (
                                <PieceItem key={edge.node.id} {...edge.node} />
                            );
                        })}
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
    /*
                                            <div>
                                                <TextField
                                                    label="Verkbeskrivelse"
                                                    onChange={this.handleChangeDescription}
                                                    value={this.state.description}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Tekst fra komponist"
                                                    onChange={this.handleChangeDescriptionComposer}
                                                    value={this.state.descriptionComposer}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Tekst fra arrangør"
                                                    onChange={this.handleChangeDescriptionArranger}
                                                    value={this.state.descriptionArranger}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Tekst fra utgiver"
                                                    onChange={this.handleChangeDescriptionPublisher}
                                                    value={this.state.descriptionPublisher}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Unikt nummer"
                                                    onChange={this.handleChangeUniqueNumber}
                                                    value={this.state.uniqueNumber}
                                                    type="number"
                                                />
                                                <TextField
                                                    label="Databasenummer"
                                                    onChange={this.handleChangeRecordNumber}
                                                    value={this.state.recordNumber}
                                                />
                                                <TextField
                                                    label="Arkivnummer"
                                                    onChange={this.handleChangeArchiveNumber}
                                                    value={this.state.archiveNumber}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Korpsoppsett"
                                                    onChange={this.handleChangeBandSetup}
                                                    value={this.state.bandSetup}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Kort sjanger"
                                                    onChange={this.handleChangeShortGenre}
                                                    value={this.state.shortGenre}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Sjanger"
                                                    onChange={this.handleChangeGenre}
                                                    value={this.state.genre}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Publisert"
                                                    onChange={this.handleChangePublished}
                                                    value={this.state.published}
                                                />
                                                <TextField
                                                    label="Innkjøpt"
                                                    onChange={this.handleChangeAquired}
                                                    value={this.state.acquired}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Vedlikeholdsstatus"
                                                    onChange={this.handleChangeMaintenanceStatus}
                                                    value={this.state.maintenanceStatus}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Nasjonalitet"
                                                    onChange={this.handleChangeNationality}
                                                    value={this.state.nationality}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Vanskelighetsgrad"
                                                    onChange={this.handleChangeDifficulty}
                                                    value={this.state.difficulty}
                                                />
                                            </div>
                                            <div>
                                                <TextField
                                                    label="Publisher"
                                                    onChange={this.handleChangePublisher}
                                                    value={this.state.publisher}
                                                />
                                            </div>
                                            */

export default Relay.createContainer(Pieces, {
    initialVariables: {
        showItems: itemsPerPage,
        term: '',
    },
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                isMusicAdmin
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
                ${CreatePieceMutation.getFragment('organization')}
            }`;
        },
    },
});
