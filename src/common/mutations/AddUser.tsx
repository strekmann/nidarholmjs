import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddUserMutation($input: AddUserInput!) {
    addUser(input: $input) {
      newUser {
        id
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
