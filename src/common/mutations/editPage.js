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
            mdtext: this.props.mdtext,
            title: this.props.title,
            summary: this.props.summary,
            permissions: this.props.permissions.map(permission => permission.id),
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on EditPagePayload {
            page
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
