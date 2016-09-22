import React from 'react';
import Relay from 'react-relay';
import Text from '../components/Text';

class About extends React.Component {
    static propTypes = {
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
        organization: () => Relay.QL`
        fragment on Organization {
            description_nb,
        }
        `,
    },
});
