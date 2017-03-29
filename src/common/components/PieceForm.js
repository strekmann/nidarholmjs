/* eslint "max-len": 0 */

import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import React from 'react';

class PieceForm extends React.Component {
    static contextTypes = {
        router: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        pieces: React.PropTypes.object, // for auto-complete
        piece: React.PropTypes.object, // for edit
        searching: React.PropTypes.bool, // for auto-complete
        isOpen: React.PropTypes.bool.isRequired,
        title: React.PropTypes.string.isRequired, // dialog title
        save: React.PropTypes.func.isRequired,
        cancel: React.PropTypes.func.isRequired,
        search: React.PropTypes.func,
    }

    state = {
        title: this.props.piece ? this.props.piece.title : '',
        subtitle: this.props.piece ? this.props.piece.subtitle : '',
        composers: this.props.piece && this.props.piece.composers.length ? this.props.piece.composers.join(', ') : '',
        arrangers: this.props.piece && this.props.piece.arrangers.length ? this.props.piece.arrangers.join(', ') : '',
        searching: this.props.searching,
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

    handleClickNewPiece = () => {
        this.setState({ searching: false });
    }

    goToPiece = (piece) => {
        this.context.router.push({ pathname: `/music/${piece.id}` });
    }

    search = (title) => {
        this.setState({ title });
        this.props.search(title);
    }

    savePiece = () => {
        const {
            title,
            subtitle,
            composers,
            arrangers,
        } = this.state;
        this.props.save({
            title,
            subtitle,
            composers,
            arrangers,
        });
    }

    render() {
        return (
            <Dialog
                title={this.props.title}
                open={this.props.isOpen}
                onRequestClose={this.props.cancel}
                autoScrollBodyContent
                actions={this.state.searching
                    ? [
                        <FlatButton
                            label="Avbryt"
                            onTouchTap={this.props.cancel}
                        />,
                        <FlatButton
                            label="Nytt stykke"
                            onTouchTap={() => {
                                this.setState({ searching: false });
                            }}
                            primary
                        />,
                    ]
                    : [
                        <FlatButton
                            label="Avbryt"
                            onTouchTap={this.props.cancel}
                        />,
                        <FlatButton
                            label="Lagre"
                            onTouchTap={this.savePiece}
                            primary
                        />,
                    ]
                }
            >
                {this.state.searching
                    ? <div>
                        <p>Søk blant stykkene som allerede er i arkivet, og legg til nytt hvis det ikke finnes</p>
                        <AutoComplete
                            dataSource={this.props.pieces.edges.map((edge) => {
                                const piece = edge.node;
                                return {
                                    text: `${piece.scoreCount}: ${piece.title} - ${piece.composers} (${piece.arrangers})`,
                                    value: piece,
                                };
                            })}
                            floatingLabelText="Tittel"
                            onNewRequest={(selected) => {
                                this.goToPiece(selected.value);
                            }}
                            onUpdateInput={(text) => {
                                this.search(text);
                            }}
                            filter={() => {
                                return true;
                            }}
                            fullWidth
                        />
                    </div>
                    : <div>
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
                                hintText="Bruk komma som skilletegn"
                            />
                        </div>
                    </div>
                }
            </Dialog>
        );
    }
}

export default PieceForm;

/*
export default Relay.createContainer(PieceForm, {
    initialVariables: {
        showItems: 50,
        title: '',
    },
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                pieces(first:$showItems,term:$title) {
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
            }`;
        },
    },
});
*/
