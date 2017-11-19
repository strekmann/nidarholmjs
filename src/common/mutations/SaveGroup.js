import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SaveGroupMutation($input: SaveGroupInput!) {
    saveGroup(input: $input) {
        group {
            email
            groupLeaderEmail
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
