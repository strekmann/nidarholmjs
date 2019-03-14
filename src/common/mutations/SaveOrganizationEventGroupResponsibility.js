import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation SaveOrganizationEventGroupResponsibilityMutation(
    $input: SaveOrganizationEventGroupResponsibilityInput!
  ) {
    saveOrganizationEventGroupResponsibility(input: $input) {
      organizationEventGroupResponsibility {
        name
        reminderText
        reminderAtHour
        reminderDaysBefore
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
