import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation JoinGroupMutation($input: JoinGroupInput!) {
    joinGroup(input: $input) {
      user {
        groups {
          id
          name
        }
      }
      group {
        members {
          id
          user(active: true) {
            id
            name
          }
          roles {
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
