import Relay from 'react-relay';

export default class AddScoreMutation extends Relay.Mutation {
    static fragments = {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
            }`;
        },
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
            //organizationId: this.props.organization.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddScorePayload {
            organization {
                piece {
                    groupscores
                }
            }
            newScoreEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'files',
            edgeName: 'newScoreEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
