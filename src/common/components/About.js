import React from 'react';
import Relay from 'react-relay';
import Text from './Text';

class About extends React.Component {
    static propTypes = {
        organization: React.PropTypes.object,
    }

    render() {
        return (
            <section>
                <h1>Om oss</h1>
                <div>
                    <Text text={this.props.organization.description_nb} />
                </div>
            </section>
        );
    }
}

export default Relay.createContainer(About, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                description_nb,
            }`;
        },
    },
});
