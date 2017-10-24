import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SendContactEmailMutation($input: SendContactEmailInput!) {
    sendContactEmail(input: $input) {
        organization {
            id
        }
    }
}`;

function commit(environment, organization, form) {
    return commitMutation(environment, {
        mutation,
        variables: {
            input: form,
        },
        onCompleted(response) {
            // console.log('completed', response);
        },
        onError(error) {
            console.error(error);
        },
    });
}

export default { commit };
