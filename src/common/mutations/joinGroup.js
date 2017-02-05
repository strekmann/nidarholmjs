import Relay from 'react-relay';

export default class JoinGroupMutation extends Relay.Mutation {
    static fragments = {
        user: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {joinGroup}`;
    }

    getVariables() {
        return {
            groupId: this.props.group.id,
            userId: this.props.user.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on JoinGroupPayload {
            group { members }
            user { groups }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                group: this.props.group.id,
                user: this.props.user.id,
            },
        }];
    }
}
