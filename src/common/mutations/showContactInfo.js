import Relay from 'react-relay';

export default class ShowContactInfoMutation extends Relay.Mutation {
    static fragments = {
        user: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {showContactInfo}`;
    }

    getVariables() {
        return {
            userId: this.props.user.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on ShowContactInfoPayload {
            user {
                id
            }
        }`;
    }

    getConfigs() {
        return [{
            type: 'REQUIRED_CHILDREN',
            children: [
                Relay.QL`
                    fragment on ShowContactInfoPayload {
                        user {
                            id
                            phone
                            email
                        }
                    }
                `,
            ],
        }];
    }
}
