import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation RemoveScoreMutation($input: RemoveScoreInput!) {
    removeScore(input: $input) {
        piece {
            files {
                edges {
                    node {
                        id
                        filename
                        path
                    }
                }
            }
            groupscores {
                id
                name
                files {
                    edges {
                        node {
                            id
                            ...ScoreItem_file
                        }
                    }
                }
            }
        }
    }
}`;

function commit(environment, fileId, pieceId, onCompleted) {
    const variables = {
        input: {
            fileId,
            pieceId,
        },
    };

    return commitMutation(environment, {
        mutation,
        variables,
        onCompleted,
    });
}

export default { commit };
