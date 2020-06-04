import { commitMutation, graphql, Environment } from "react-relay";
import { SendContactEmailInput } from "./__generated__/SendContactEmailMutation.graphql";

const mutation = graphql`
  mutation SendContactEmailMutation($input: SendContactEmailInput!) {
    sendContactEmail(input: $input) {
      organization {
        id
      }
    }
  }
`;

function commit(environment: Environment, form: SendContactEmailInput) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: form,
    },
  });
}

export default { commit };
