import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation CreateRoleMutation($input: CreateRoleInput!) {
    createRole(input: $input) {
        organization {
            ...Roles_organization
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
