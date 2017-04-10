/* eslint "class-methods-use-this": 0 */

import Relay from 'react-relay';

export default class SaveFilePermissionsMutation extends Relay.Mutation {
    static fragments = {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {saveFilePermissions}`;
    }

    getVariables() {
        return {
            fileId: this.props.fileId,
            permissions: this.props.permissions,
            tags: this.props.tags,
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
