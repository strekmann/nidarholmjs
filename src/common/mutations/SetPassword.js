import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation SetPasswordMutation($input: SetPasswordInput!) {
    setPassword(input: $input) {
      viewer {
        ...MemberReset_viewer
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
