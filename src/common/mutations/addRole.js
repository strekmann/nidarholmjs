import Relay from 'react-relay';

export default class AddRoleMutation extends Relay.Mutation {
    static fragments = {
        member: () => Relay.QL`
        fragment on Member {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addRole}`;
    }

    getVariables() {
        return {
            roleId: this.props.roleId,
            memberId: this.props.member.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddRolePayload {
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
