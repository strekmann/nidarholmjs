/* eslint "class-methods-use-this": 0 */

import Relay from 'react-relay';

export default class SetProfilePictureMutation extends Relay.Mutation {
    static fragments = {
        user: () => {
            return Relay.QL`
            fragment on User {
                id
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {setProfilePicture}`;
    }

    getVariables() {
        return {
            userId: this.props.user.id,
            hash: this.props.hash,
            mimetype: this.props.mimetype,
            size: this.props.size,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on SetProfilePicturePayload {
            user { profilePicture }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                user: this.props.user.id,
            },
        }];
    }
}
