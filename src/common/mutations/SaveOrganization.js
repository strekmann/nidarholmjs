import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SaveOrganizationMutation($input: SaveOrganizationInput!) {
    saveOrganization(input: $input) {
        organization {
            ...Organization_organization
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
