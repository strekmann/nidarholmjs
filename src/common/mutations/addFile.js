import Relay from 'react-relay';

export default class AddFileMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addFile}`;
    }

    getVariables() {
        return {
            filename: this.props.filename,
            hex: this.props.hex,
            tags: this.props.tags,
            permissions: this.props.permissions.map(permission => permission.id),
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddFilePayload {
            organization
            newFileEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'files',
            edgeName: 'newFileEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
