import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddEventPersonResponsibilityMutation(
    $input: AddEventPersonResponsibilityInput!
  ) {
    addEventPersonResponsibility(input: $input) {
      event {
        contributors {
          user {
            name
          }
          role
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
