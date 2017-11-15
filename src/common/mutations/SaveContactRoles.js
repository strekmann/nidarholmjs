import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SaveContactRolesMutation($input: SaveContactRolesInput!) {
    saveContactRoles(input: $input) {
        organization {
            ...ContactRoles_organization
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
