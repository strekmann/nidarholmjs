import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation CreatePieceMutation($input: CreatePieceInput!) {
    createPiece(input: $input) {
      organization {
        ...Pieces_organization
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
