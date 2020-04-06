import { commitMutation, graphql } from "react-relay";

const mutation = graphql`
  mutation EditUserMutation($input: EditUserInput!) {
    editUser(input: $input) {
      user {
        username
        name
        email
        isActive
        isAdmin
        created
        facebookId
        googleId
        twitterId
        nmfId
        phone
        address
        postcode
        city
        country
        born
        joined
        instrument
        instrumentInsurance
        reskontro
        membershipHistory
        membershipStatus
        inList
        onLeave
        noEmail
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
