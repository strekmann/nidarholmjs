import Relay from 'react-relay';

export default class AddPageMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {addPage}`;
    }

    getVariables() {
        return {
            slug: this.props.slug,
            mdtext: this.props.mdtext,
            summary: this.props.summary,
            title: this.props.title,
            permissions: this.props.permissions.map(permission => permission.id),
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddPagePayload {
            organization
            newPageEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'pages',
            edgeName: 'newPageEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
