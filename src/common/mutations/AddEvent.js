import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation AddEventMutation($input: AddEventInput!) {
    addEvent(input: $input) {
      project {
        events(first: 100) {
          edges {
            node {
              id
              ...EventItem_event
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
