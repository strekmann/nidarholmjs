import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddPieceMutation($input: AddPieceInput!) {
    addPiece(input: $input) {
        project {
            music {
                id
                piece {
                    id
                    title
                    composers
                }
            }
        }
    }
}`;

function commit(environment, input, onCompleted) {
    const { projectId, pieceId } = input;
    const variables = {
        input: {
            projectId,
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
