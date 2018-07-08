import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation UpdatePieceMutation($input: UpdatePieceInput!) {
    updatePiece(input: $input) {
      piece {
        id
        title
        subtitle
        composers
        arrangers
      }
    }
  }
`;

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
