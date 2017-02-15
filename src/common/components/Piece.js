/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import axios from 'axios';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import theme from '../theme';

import List from './List';
import GroupScores from './GroupScores';
import AddScoreMutation from '../mutations/addScore';
import UpdatePieceMutation from '../mutations/updatePiece';

class Piece extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        title: this.props.organization.piece.title || '',
        subtitle: this.props.organization.piece.subtitle || '',
        composers: this.props.organization.piece.composers.length ? this.props.organization.piece.composers.join(', ') : '',
        arrangers: this.props.organization.piece.arrangers.length ? this.props.organization.piece.arrangers.join(', ') : '',
        editPiece: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    handleCloseEditPiece = () => {
        this.setState({ editPiece: false });
    }

    handleSubmitUpdatePiece = (event) => {
        event.preventDefault();
        this.setState({ editPiece: false });
        this.context.relay.commitUpdate(new UpdatePieceMutation({
            composers: this.state.composers.split(','),
            arrangers: this.state.arrangers.split(','),
            title: this.state.title,
            subtitle: this.state.subtitle,
            piece: this.props.organization.piece,
        }));
    }

    handleChangeTitle = (event, title) => {
        this.setState({ title });
    }

    handleChangeSubtitle = (event, subtitle) => {
        this.setState({ subtitle });
    }

    handleChangeComposers = (event, composers) => {
        this.setState({ composers });
    }

    handleChangeArrangers = (event, arrangers) => {
        this.setState({ arrangers });
    }

    uploadScores = (files, group) => {
        files.forEach((file) => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new AddScoreMutation({
                    viewer: null,
                    organization: this.props.organization,
                    hex: response.data.hex,
                    filename: file.name,
                    group,
                    piece: this.props.organization.piece,
                }));
            });
        });
    }

    render() {
        const org = this.props.organization;
        const piece = org.piece;
        const isMusicAdmin = org.isMusicscoreadmin;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{piece.title} <small>{piece.subtitle}</small></h1>
                    {isMusicAdmin
                            ? <Dialog
                                title={`Rediger ${this.state.title}`}
                                open={this.state.editPiece}
                                onRequestClose={this.handleCloseEditPiece}
                                autoScrollBodyContent
                                actions={
                                    <FlatButton
                                        label="Avbryt"
                                        onTouchTap={this.handleCloseEditPiece}
                                    />
                                }
                            >
                                <form onSubmit={this.handleSubmitUpdatePiece}>
                                    <div>
                                        <TextField
                                            floatingLabelText="Komponist(er)"
                                            onChange={this.handleChangeComposers}
                                            value={this.state.composers}
                                            hintText="Bruk komma som skilletegn"
                                        />
                                    </div>
                                    <div>
                                        <TextField
                                            floatingLabelText="Arrangør(er)"
                                            onChange={this.handleChangeArrangers}
                                            value={this.state.arrangers}
                                        />
                                    </div>
                                    <div>
                                        <TextField
                                            floatingLabelText="Tittel"
                                            onChange={this.handleChangeTitle}
                                            value={this.state.title}
                                        />
                                    </div>
                                    <div>
                                        <TextField
                                            floatingLabelText="Undertittel"
                                            onChange={this.handleChangeSubtitle}
                                            value={this.state.subtitle}
                                        />
                                    </div>
                                    <div>
                                        <RaisedButton
                                            label="Lagre"
                                            primary
                                            type="submit"
                                        />
                                    </div>
                                </form>
                            </Dialog>
                            : null
                    }
                    <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
                        <ToolbarGroup lastChild>
                            <IconMenu
                                iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                {isMusicAdmin
                                        ? <MenuItem
                                            primaryText="Rediger info om stykke"
                                            onTouchTap={() => {
                                                this.setState({ editPiece: !this.state.editPiece });
                                            }}
                                        />
                                        : null
                                }
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                </div>
                <h2>
                    <List items={piece.composers} /> <small><List items={piece.arrangers} /></small>
                </h2>
                {piece.files.edges.map(edge => (
                    <div key={edge.node.id}>
                        <FlatButton href={edge.node.path} label={edge.node.filename} />
                    </div>
                ))}

                {org.isMusicscoreadmin ?
                    <div>
                        <h2>Admin</h2>
                        {piece.groupscores.map(group => (
                            <GroupScores
                                key={group.id}
                                uploadScores={this.uploadScores}
                                {...group}
                            />
                        ))}
                    </div>
                    : null}
            </Paper>
        );
    }
}

export default Relay.createContainer(Piece, {
    initialVariables: {
        pieceId: '',
    },
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            id
            name
            isMember
            isMusicscoreadmin
            piece(pieceId:$pieceId) {
                id
                title
                subtitle
                composers
                arrangers
                files {
                    edges {
                        node {
                            id
                            filename
                            path
                        }
                    }
                }
                groupscores {
                    id
                    name
                    files {
                        edges {
                            node {
                                id
                                filename
                                path
                            }
                        }
                    }
                }
                ${UpdatePieceMutation.getFragment('piece')}
            }
            ${AddScoreMutation.getFragment('organization')}
        }`,
    },
});
