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

    getVariables() {
        console.log("adf", this.props);
        return {
            filename: this.props.filename,
            hex: this.props.hex,
        };
    }

    getFatQuery() {
        console.log("adacwaf", this.props);
        return Relay.QL`
        fragment on AddFilePayload {
            organization {
                files
            }
            newFileEdge
        }`;
    }

    getConfigs() {
        console.log("wasadf", this.props);
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
