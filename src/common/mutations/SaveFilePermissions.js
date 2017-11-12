import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SaveFilePermissionsMutation($input: SaveFilePermissionsInput!) {
    saveFilePermissions(input: $input) {
        file {
            id
            permissions {
                public
                groups {
                    id
                    name
                }
            }
            tags
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
