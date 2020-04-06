import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddOrganizationEventPersonResponsibilityMutation(
    $input: AddOrganizationEventPersonResponsibilityInput!
  ) {
    addOrganizationEventPersonResponsibility(input: $input) {
      organization {
        ...Organization_organization
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
