import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation SetProjectPosterMutation($input: SetProjectPosterInput!) {
    setProjectPoster(input: $input) {
      project {
        id
        poster {
          filename
          largePath
        }
      }
    }
  }
`;

function commit(environment, input, onCompleted) {
  const { fileId, projectId } = input;
  const variables = {
    input: {
      fileId,
      projectId,
    },
  };

  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
  });
}

export default { commit };
