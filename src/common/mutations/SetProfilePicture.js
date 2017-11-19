import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SetProfilePictureMutation($input: SetProfilePictureInput!) {
    setProfilePicture(input: $input) {
        user {
            profilePicture {
                normalPath
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
