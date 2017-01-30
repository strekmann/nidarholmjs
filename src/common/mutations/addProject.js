import Relay from 'react-relay';

export default class AddProjectMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }`,
    }

    getMutation() {
        return Relay.QL`mutation {addProject}`;
    }

    getVariables() {
        return {
            title: this.props.title,
            tag: this.props.tag,
            privateMdtext: this.props.privateMdtext,
            publicMdtext: this.props.publicMdtext,
            start: this.props.start,
            end: this.props.end,
            permissions: this.props.permissions,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddProjectPayload {
            organization
            newProjectEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'nextProjects',
            edgeName: 'newProjectEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
