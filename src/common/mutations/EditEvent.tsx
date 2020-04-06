import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation EditEventMutation($input: EditEventInput!) {
    editEvent(input: $input) {
      event {
        id
        title
        location
        start
        end
        projects {
          id
          year
          tag
          title
        }
        mdtext
        permissions {
          public
          groups {
            id
            name
          }
          users {
            id
            name
          }
        }
        highlighted
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
