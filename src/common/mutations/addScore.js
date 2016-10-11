import Relay from 'react-relay';

export default class AddScoreMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addScore}`;
    }

    getVariables() {
        return {
            filename: this.props.filename,
            hex: this.props.hex,
            pieceId: this.props.piece.id,
            groupId: this.props.group.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddScorePayload {
            group {
                scores
            }
            scoreEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'group',
            parentID: this.props.groupId,
            connectionName: 'scores',
            edgeName: 'scoreEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
