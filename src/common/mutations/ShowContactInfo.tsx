import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation ShowContactInfoMutation($input: ShowContactInfoInput!) {
    showContactInfo(input: $input) {
      user {
        id
        email
        phone
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
