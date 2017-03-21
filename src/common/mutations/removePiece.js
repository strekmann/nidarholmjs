import Relay from 'react-relay';

export default class RemovePieceMutation extends Relay.Mutation {
    static fragments = {
        project: () => {
            return Relay.QL`
            fragment on Project {
                id
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {removePiece}`;
    }

    getVariables() {
        return {
            projectId: this.props.project.id,
            pieceId: this.props.piece.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on RemovePiecePayload {
            project { music }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                project: this.props.project.id,
            },
        }];
    }
}
