import React from 'react';
import Relay from 'react-relay';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';

import theme from '../theme';

import List from './List';
import GroupScores from './GroupScores';

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
                        {piece.groupscores.map(group => <GroupScores key={group.id} {...group} />)}
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

