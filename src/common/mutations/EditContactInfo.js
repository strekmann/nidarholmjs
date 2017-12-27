import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation EditContactInfoMutation($input: EditContactInfoInput!) {
    editContactInfo(input: $input) {
        organization {
            visitorAddress,
            visitorLocation,
            city,
            mailAddress,
            postcode,
            organizationNumber,
            publicBankAccount,
            contactText,
            mapText,
            mapUrl,
        }
    }
}`;

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
