import Relay from 'react-relay';

export default class AddMemberMutation extends Relay.Mutation {
    static fragments = {
        group: () => Relay.QL`
        fragment on Group {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addMember}`;
    }

    getVariables() {
        return {
            groupId: this.props.group.id,
            userId: this.props.user.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddMemberPayload {
            group { members }
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
