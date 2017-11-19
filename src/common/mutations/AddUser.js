import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddUserMutation($input: AddUserInput!) {
    addUser(input: $input) {
        newUser {
            id
        }
    }
}`;

function commit(environment, input, onCompleted) {
    const variables = {
        input,
    };

    return commitMutation(environment, {
        mutation,
        variables,
        onCompleted,
    });
}

export default { commit };
/*
import Relay from 'react-relay';

export default class AddEventMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addUser}`;
    }

    getVariables() {
        return {
            name: this.props.name,
            email: this.props.email,
            instrument: this.props.instrument,
            isMember: this.props.isMember,
            groupId: this.props.groupId,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddUserPayload {
            organization
            newUser
        }`;
    }

    getConfigs() {
        return [
            {
                type: 'FIELDS_CHANGE',
                fieldIDs: {
                    organization: this.props.organization.id,
                },
            },
            {
                type: 'REQUIRED_CHILDREN',
                children: [
                    Relay.QL`
                    fragment on AddUserPayload {
                        newUser {
                            name
                            username
                        }
                    }
                    `,
                ],
            },
        ];
    }
    }*/