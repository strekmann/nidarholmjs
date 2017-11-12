import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddFileMutation($input: AddFileInput!) {
    addFile(input: $input) {
        organization {
            ...Files_organization
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
