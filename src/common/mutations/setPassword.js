import Relay from 'react-relay';

export default class SetPasswordMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {setPassword}`;
    }

    getVariables() {
        return {
            oldPassword: this.props.oldPassword,
            newPassword: this.props.newPassword,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SetPasswordPayload {
            viewer
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                viewer: this.props.viewer.id,
            },
        }];
    }
}
