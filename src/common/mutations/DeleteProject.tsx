import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation DeleteProjectMutation($input: DeleteProjectInput!) {
    deleteProject(input: $input) {
      organization {
        projects(first: 100) {
          edges {
            node {
              id
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
