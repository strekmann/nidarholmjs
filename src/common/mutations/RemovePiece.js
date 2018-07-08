import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation RemovePieceMutation($input: RemovePieceInput!) {
    removePiece(input: $input) {
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
  }
`;

function commit(environment, input, onCompleted) {
  const { pieceId, projectId } = input;
  const variables = {
    input: {
      pieceId,
      projectId,
    },
  };

  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
  });
}

export default { commit };
