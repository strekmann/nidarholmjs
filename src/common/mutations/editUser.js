import Relay from 'react-relay';

export default class EditEventMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {editUser}`;
    }

    getVariables() {
        return {
            userId: this.props.userId,
            username: this.props.username,
            name: this.props.name,
            phone: this.props.phone,
            email: this.props.email,
            instrument: this.props.instrument,
            born: this.props.born,
            address: this.props.address,
            postcode: this.props.postcode,
            city: this.props.city,
            country: this.props.country,
            joined: this.props.joined,
            nmfId: this.props.nmfId,
            reskontro: this.props.reskontro,
            membershipHistory: this.props.membershipHistory,
            inList: this.props.inList,
            onLeave: this.props.onLeave,
            noEmail: this.props.noEmail,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on EditUserPayload {
            organization {
                member
            }
        }`;
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                organization: this.props.organization.id,
            },
        }];
    }
}
