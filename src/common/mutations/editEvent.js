import Relay from 'react-relay';

export default class EditEventMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
            }`;
        },
    }

    getMutation() {
        return Relay.QL`mutation {editEvent}`;
    }

    getVariables() {
        return {
            eventid: this.props.eventid,
            title: this.props.title,
            location: this.props.location,
            start: this.props.start,
            end: this.props.end,
            mdtext: this.props.mdtext,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on EditEventPayload {
            event {
                id
                title
                location
                start
                end
                mdtext
            }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                event: this.props.eventid,
            },
        }];
    }
}
