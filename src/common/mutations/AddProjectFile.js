import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddProjectFileMutation($input: AddFileInput!) {
    addFile(input: $input) {
        project {
            files(first:100) {
                edges {
                    node {
                        id
                        filename
                        created
                        mimetype
                        size
                        permissions {
                            public
                            groups {
                                id
                                name
                            }
                            users {
                                id
                                name
                            }
                        }
                        tags
                        isImage
                        thumbnailPath
                        path
                    }
                }
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
