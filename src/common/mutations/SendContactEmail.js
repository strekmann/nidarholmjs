import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation SendContactEmailMutation($input: SendContactEmailInput!) {
    sendContactEmail(input: $input) {
      organization {
        id
      }
    }
  }
`;

function commit(environment, form) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: form,
    },
  });
}

export default { commit };
