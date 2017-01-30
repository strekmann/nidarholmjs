import Relay from 'react-relay';

export default class SaveProjectMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {saveProject}`;
    }

    getVariables() {
        return {
            id: this.props.id,
            title: this.props.title,
            tag: this.props.tag,
            privateMdtext: this.props.privateMdtext,
            publicMdtext: this.props.publicMdtext,
            start: this.props.start,
            end: this.props.end,
            permissions: this.props.permissions,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SaveProjectPayload {
            organization {
                project
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
