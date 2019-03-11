import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddEventGroupResponsibilityMutation(
    $input: AddEventGroupResponsibilityInput!
  ) {
    addEventGroupResponsibility(input: $input) {
      event {
        contributorGroups {
          group {
            name
          }
          role {
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
