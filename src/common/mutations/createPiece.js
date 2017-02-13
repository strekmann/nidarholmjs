import Relay from 'react-relay';

export default class CreatePieceMutation extends Relay.Mutation {
    static fragments = {
        organization: () => Relay.QL`
        fragment on Organization {
            id
        }
        `,
    }

    getMutation() {
        return Relay.QL`mutation {createPiece}`;
    }

    getVariables() {
        return {
            title: this.props.title,
            subtitle: this.props.subtitle,
            composers: this.props.composers,
            arrangers: this.props.arrangers,
        };
    }

    getFatQuery() {
        return Relay.QL`
        fragment on CreatePiecePayload {
            organization
            newPieceEdge
        }`;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'organization',
            parentID: this.props.organization.id,
            connectionName: 'pieces',
            edgeName: 'newPieceEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        }];
    }
}
