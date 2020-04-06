import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation SendResetMutation($input: SendResetInput!) {
    sendReset(input: $input) {
      organization {
        ...Reset_organization
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
