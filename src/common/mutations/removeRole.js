import Relay from 'react-relay';

export default class RemoveRoleMutation extends Relay.Mutation {
    static fragments = {
        member: () => Relay.QL`
        fragment on Member {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {removeRole}`;
    }

    getVariables() {
        return {
            roleId: this.props.roleId,
            memberId: this.props.member.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on RemoveRolePayload {
            member { roles }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                member: this.props.member.id,
            },
        }];
    }
}
