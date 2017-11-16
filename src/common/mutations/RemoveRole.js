import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation RemoveRoleMutation($input: RemoveRoleInput!) {
    removeRole(input: $input) {
        member {
            id
            roles {
                id
                name
            }
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
