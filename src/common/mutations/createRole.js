import Relay from 'react-relay';

export default class CreateRoleMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {createRole}`;
    }

    getVariables() {
        return {
            name: this.props.name,
            email: this.props.email,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on CreateRolePayload {
            organization
            newRoleEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'roles',
            edgeName: 'newRoleEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
