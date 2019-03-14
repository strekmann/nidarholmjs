import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation RemoveEventPersonResponsibilityMutation(
    $input: RemoveEventPersonResponsibilityInput!
  ) {
    removeEventPersonResponsibility(input: $input) {
      event {
        contributors {
          id
          user {
            name
          }
          role {
            id
            name
          }
        }
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
