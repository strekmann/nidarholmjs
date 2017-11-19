import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddRoleMutation($input: AddRoleInput!) {
    addRole(input: $input) {
        member {
            id
            roles {
                id
                name
                email
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
