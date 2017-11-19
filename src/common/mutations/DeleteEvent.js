import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation DeleteEventMutation($input: DeleteEventInput!) {
    deleteEvent(input: $input) {
        organization {
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
