import Relay from 'react-relay';

export default class SetProjectPosterMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {setProjectPoster}`;
    }

    getVariables() {
        return {
            fileId: this.props.fileId,
            projectId: this.props.projectId,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SetProjectPosterPayload {
            project
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                project: this.props.projectId,
            },
        }];
    }
}
