import Relay from 'react-relay';

export default class RemoveScoreMutation extends Relay.Mutation {
    static fragments = {
        groupscore: () => {
            return Relay.QL`
            fragment on Groupscore {
                id
                organization {
                    id
                }
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {removeScore}`;
    }

    getVariables() {
        return {
            fileId: this.props.file.id,
            pieceId: this.props.piece.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on RemoveScorePayload {
            organization {
                piece {
                    groupscores
                }
            }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                organization: this.props.groupscore.organization.id,
            },
        }];
    }
}
