import Relay from 'react-relay';

export default class SendResetMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {sendReset}`;
    }

    getVariables() {
        return {
            email: this.props.email,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SendResetPayload {
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
