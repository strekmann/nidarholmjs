import Relay from 'react-relay';

export default class RemoveMemberMutation extends Relay.Mutation {
    static fragments = {
        group: () => Relay.QL`
        fragment on Group {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {removeMember}`;
    }

    getVariables() {
        return {
            groupId: this.props.group.id,
            memberId: this.props.member.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on RemoveMemberPayload {
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
