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
            organization {
                piece {
                    groupscores {
                        scores
                    }
                }
            }
        }`;
    }

    getConfigs() {
        console.log(this.props);
        return [{
            type: 'RANGE_ADD',
            parentName: 'groupscores',
            parentID: this.props.group.id,
            connectionName: 'scores',
            edgeName: 'newScoreEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
