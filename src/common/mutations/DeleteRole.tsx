import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation DeleteRoleMutation($input: DeleteRoleInput!) {
    deleteRole(input: $input) {
      organization {
        roles(first: 100) {
          edges {
            node {
              id
              name
              email
            }
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
