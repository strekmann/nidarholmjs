import Relay from 'react-relay';

export default class SaveFilePermissionsMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {SaveFilePermissions}`;
    }

    getVariables() {
        return {
            fileId: this.props.fileId,
            permissions: this.props.permissions,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SaveFilePermissionsPayload {
            file
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                file: this.props.fileId,
            },
        }];
    }
}
