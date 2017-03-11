import React from 'react';
import Relay from 'react-relay';

class Roles extends React.Component {
    static propTypes = {
        organization: React.PropTypes.object,
    }
    render() {
        return (
            <div>
                <h1>Roller</h1>
                <ul>
                    {this.props.organization.roles.edges.map((edge) => {
                        return <li key="{edge.node.id}">{edge.node.name}</li>;
                    })}
                </ul>
            </div>
        );
    }
}

export default Relay.createContainer(Roles, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                roles(first:100) {
                    edges {
                        node {
                            id
                            name
                            email
                        }
                    }
                }
            }`;
        },
    },
});
