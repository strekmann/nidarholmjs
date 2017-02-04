import Relay from 'react-relay';

export default class SendContactEmailMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {sendContactEmail}`;
    }

    getVariables() {
        return {
            email: this.props.email,
            name: this.props.name,
            text: this.props.text,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SendContactEmailPayload {
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
