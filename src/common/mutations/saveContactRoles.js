import Relay from 'react-relay';

export default class SaveContactRolesMutation extends Relay.Mutation {
    static fragments = {
        organization: () => {
            return Relay.QL`
                fragment on Organization {
                id
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {saveContactRoles}`;
    }

    getVariables() {
        return {
            contactRoles: this.props.contactRoles.map((role) => {
                return role.id;
            }),
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SaveContactRolesPayload {
            organization
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                organization: this.props.organization.id,
            },
        }];
    }
}
