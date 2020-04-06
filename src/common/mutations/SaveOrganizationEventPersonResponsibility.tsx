import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation SaveOrganizationEventPersonResponsibilityMutation(
    $input: SaveOrganizationEventPersonResponsibilityInput!
  ) {
    saveOrganizationEventPersonResponsibility(input: $input) {
      organizationEventPersonResponsibility {
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
