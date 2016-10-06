import Relay from 'react-relay';

export default class AddFileMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addFile}`;
    }

    getFiles() {
        return {
            file: this.props.file,
        };
    }

    getVariables() {
        return {
            filename: this.props.file.name,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddFilePayload {
            organization {
                files
            }
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
