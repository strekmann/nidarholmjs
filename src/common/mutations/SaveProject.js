import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation SaveProjectMutation($input: SaveProjectInput!) {
    saveProject(input: $input) {
        project {
            title
            tag
            start
            end
            year
            publicMdtext
            privateMdtext
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
