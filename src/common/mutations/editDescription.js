import Relay from 'react-relay';

export default class EditDescriptionMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {editDescription}`;
    }

    getVariables() {
        return {
            orgid: this.props.organization.id,
            description_nb: this.props.description_nb,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on EditDescriptionPayload {
            organization {
                id
                description_nb
            }
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
