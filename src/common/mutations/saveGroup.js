import Relay from 'react-relay';

export default class SaveGroupMutation extends Relay.Mutation {
    static fragments = {
        group: () => Relay.QL`
        fragment on Group {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {saveGroup}`;
    }

    getVariables() {
        return {
            groupId: this.props.group.id,
            email: this.props.email,
            groupLeaderEmail: this.props.groupLeaderEmail,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SaveGroupPayload {
            group { email, groupLeaderEmail }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                group: this.props.group.id,
            },
        }];
    }
}
