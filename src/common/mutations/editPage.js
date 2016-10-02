import Relay from 'react-relay';

export default class EditPageMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {editPage}`;
    }

    getVariables() {
        return {
            pageid: this.props.pageid,
            slug: this.props.slug,
            summary: this.props.summary,
            mdtext: this.props.mdtext,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on EditPagePayload {
            page {
                id
                slug
                summary
                mdtext
            }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                page: this.props.pageid,
            },
        }];
    }
}
