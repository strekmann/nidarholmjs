import Relay from 'react-relay';

export default class SaveOrganizationMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {saveOrganization}`;
    }

    getVariables() {
        return {
            summaryIds: this.props.summaries,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SaveOrganizationPayload {
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
