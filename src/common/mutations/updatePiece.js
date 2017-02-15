import Relay from 'react-relay';

export default class UpdatePieceMutation extends Relay.Mutation {
    static fragments = {
        piece: () => Relay.QL`
        fragment on Piece {
            id
        }
        `,
    }

    getMutation = () => Relay.QL`mutation {updatePiece}`

    getVariables() {
        return {
            id: this.props.piece.id,
            title: this.props.title,
            subtitle: this.props.subtitle,
            composers: this.props.composers,
            arrangers: this.props.arrangers,
        };
    }

    getFatQuery = () => Relay.QL`
        fragment on UpdatePiecePayload {
            piece
        }`

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                piece: this.props.piece.id,
            },
        }];
    }
}
