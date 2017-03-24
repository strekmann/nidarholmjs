import Relay from 'react-relay';

export default class DeleteRoleMutation extends Relay.Mutation {
    static fragments = {
        event: () => {
            return Relay.QL`
            fragment on Event {
                id
                projects {
                    id
                }
            }
            `;
        },
    }

    getMutation() {
        return Relay.QL`mutation {deleteEvent}`;
    }

    getVariables() {
        return {
            id: this.props.event.id,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on DeleteEventPayload {
            organization { events }
            projects { events }
            deletedEventID
        }`;
    }

    getConfigs() {
        const configs = [{
            type: 'NODE_DELETE',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'events',
            deletedIDFieldName: 'deletedEventID',
        }];

/*
        this.props.event.projects.forEach((project) => {
            configs.push({
                type: 'NODE_DELETE',
                parentName: 'project',
                parentID: project.id,
                connectionName: 'events',
                deletedIDFieldName: 'deletedEventID',
            });
        });
        */

        return configs;
    }
}
