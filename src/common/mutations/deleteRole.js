import Relay from 'react-relay';

export default class DeleteRoleMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {deleteRole}`;
    }

    getVariables() {
        return {
            id: this.props.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on DeleteRolePayload {
            organization { roles }
            deletedRoleID
        }`;
    }

    getConfigs() {
        return [{
            type: 'NODE_DELETE',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'roles',
            deletedIDFieldName: 'deletedRoleID',
        }];
    }
}
