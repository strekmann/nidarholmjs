import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddProjectMutation($input: AddProjectInput!) {
    addProject(input: $input) {
      organization {
        ...Projects_organization
      }
    }
  }
`;

function commit(
  environment,
  { title, tag, privateMdtext, publicMdtext, start, end, permissions },
  onCompleted,
) {
  const variables = {
    input: {
      title,
      tag,
      privateMdtext,
      publicMdtext,
      start,
      end,
      permissions,
    },
  };

  return commitMutation(environment, {
    mutation,
    variables,
    onCompleted,
  });
}

export default { commit };
