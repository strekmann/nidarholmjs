import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddScoreMutation($input: AddScoreInput!) {
    addScore(input: $input) {
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

function commit(environment, file, onCompleted) {
    const variables = {
        input: {
            filename: file.filename,
            hex: file.hex,
            pieceId: file.piece.id,
            groupId: file.groupscore.id,
        },
    };

    return commitMutation(environment, {
        mutation,
        variables,
        onCompleted,
    });
}

export default { commit };
