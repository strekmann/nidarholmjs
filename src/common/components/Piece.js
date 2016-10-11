/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import axios from 'axios';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';

import theme from '../theme';

import List from './List';
import GroupScores from './GroupScores';
import AddScoreMutation from '../mutations/addScore';

class Piece extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    uploadScores = (files, group) => {
        files.forEach(file => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new AddScoreMutation({
                    viewer: null,
                    organization: null,
                    hex: response.data.hex,
                    filename: file.name,
                    group,
                    piece: this.props.organization.piece,
                }), {
                    onSuccess: () => {
                        // console.log("successfile");
                    },
                    onFailure: transaction => {
                        console.error(transaction.getError().source.errors);
                    },
                });
            })
            .catch(error => {
                console.error("err", error);
            });
        });
    }

    render() {
        const org = this.props.organization;
        const piece = org.piece;
        return (
            <section>
                {org.is_musicscoreadmin ? '(Noteadmin)' : null}
                <h1>{piece.title} <small>{piece.subtitle}</small></h1>
                <h2>
                    <List items={piece.composers} /> <small><List items={piece.arrangers} /></small>
                </h2>
                {piece.scores.map(
                    file => <div key={file.id}>
                        <FlatButton href={file.path} label={file.filename} />
                    </div>
                    )
                }

                {org.is_musicscoreadmin ?
                    <div>
                        <h2>Admin</h2>
                        {piece.groupscores.map(
                            group => <GroupScores
                                key={group.id}
                                uploadScores={this.uploadScores}
                                {...group}
                            />
                            )
                        }
                    </div>
                    : null}
            </section>
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
            name
            is_member
            is_musicscoreadmin
            piece(pieceId:$pieceId) {
                id
                title
                composers
                arrangers
                scores {
                    id
                    filename
                    path
                }
                groupscores {
                    id
                    name
                    scores {
                        id
                        filename
                        path
                    }
                }
            }
        }`,
    },
});

