import { commitMutation, graphql } from 'react-relay';

const mutation = graphql`
mutation EditPageMutation($input: EditPageInput!) {
    editPage(input: $input) {
        page {
            id
        }
    }
}`;

function commit(environment, page, onCompleted) {
    const variables = {
        input: {
            pageid: page.id,
            slug: page.slug,
            mdtext: page.mdtext,
            title: page.title,
            summary: page.summary,
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
