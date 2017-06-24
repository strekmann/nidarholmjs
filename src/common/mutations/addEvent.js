/* eslint "class-methods-use-this": 0 */

import Relay from 'react-relay';

export default class AddEventMutation extends Relay.Mutation {
    static fragments = {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {addEvent}`;
    }

    getVariables() {
        return {
            title: this.props.title,
            location: this.props.location,
            start: this.props.start,
            end: this.props.end,
            tags: this.props.tags,
            mdtext: this.props.mdtext,
            permissions: this.props.permissions,
            highlighted: this.props.highlighted,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on AddEventPayload {
            organization
            newEventEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'events',
            edgeName: 'newEventEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
