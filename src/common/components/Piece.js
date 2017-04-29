import React from 'react';
import Relay from 'react-relay';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { MenuItem } from 'material-ui/Menu';
import Paper from 'material-ui/Paper';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import theme from '../theme';
import UpdatePieceMutation from '../mutations/updatePiece';

import List from './List';
import Groupscore from './Groupscore';
import PieceForm from './PieceForm';

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
        editPiece: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    handleCloseEditPiece = () => {
        this.setState({ editPiece: false });
    }

    savePiece = (piece) => {
        this.setState({ editPiece: false });
        const {
            composers,
            arrangers,
            title,
            subtitle,
        } = piece;
        this.context.relay.commitUpdate(new UpdatePieceMutation({
            composers: composers.split(','),
            arrangers: arrangers.split(','),
            title,
            subtitle,
            piece: this.props.organization.piece,
        }));
    }

    render() {
        const org = this.props.organization;
        const piece = org.piece;
        const isMusicAdmin = org.isMusicAdmin;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{piece.title} <small>{piece.subtitle}</small></h1>
                    {isMusicAdmin
                        ? <PieceForm
                            title="Rediger stykke"
                            isOpen={this.state.editPiece}
                            save={this.savePiece}
                            cancel={this.handleCloseEditPiece}
                            piece={piece}
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
                {piece.files.edges.map((edge) => {
                    return (
                        <div key={edge.node.id}>
                            <FlatButton href={edge.node.path} label={edge.node.filename} />
                        </div>
                    );
                })}
                {org.isMusicAdmin ?
                    <div>
                        <h2>Admin</h2>
                        {piece.groupscores.map((groupscore) => {
                            return (
                                <Groupscore
                                    key={groupscore.id}
                                    groupscore={groupscore}
                                    piece={piece}
                                />
                            );
                        })}
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
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                name
                isMember
                isMusicAdmin
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
                        ${Groupscore.getFragment('groupscore')}
                    }
                    ${UpdatePieceMutation.getFragment('piece')}
                }
            }`;
        },
    },
});
