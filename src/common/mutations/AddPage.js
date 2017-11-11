import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation AddPageMutation($input: AddPageInput!) {
    addPage(input: $input) {
        organization {
            ...Pages_organization
        }
    }
}`;

function commit(environment, page, onCompleted) {
    const variables = {
        input: {
            slug: page.slug,
            mdtext: page.mdtext,
            summary: page.summary,
            title: page.title,
            permissions: page.permissions.map((permission) => {
                return permission.id;
            }),
        },
    };
    return commitMutation(environment, {
        mutation,
        variables,
        onCompleted,
    });
}

export default { commit };
