import Relay from 'react-relay';

export default class LeaveGroupMutation extends Relay.Mutation {
    static fragments = {
        user: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {leaveGroup}`;
    }

    getVariables() {
        return {
            groupId: this.props.group.id,
            userId: this.props.user.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on LeaveGroupPayload {
            user { groups }
            group { members }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.user.id,
                group: this.props.group.id,
            },
        }];
    }
}
