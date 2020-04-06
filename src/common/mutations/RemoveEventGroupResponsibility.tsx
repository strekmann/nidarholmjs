import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation RemoveEventGroupResponsibilityMutation(
    $input: RemoveEventGroupResponsibilityInput!
  ) {
    removeEventGroupResponsibility(input: $input) {
      event {
        contributorGroups {
          id
          group {
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
