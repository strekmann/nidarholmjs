import React from 'react';
import Relay from 'react-relay';
import { Grid, Row, Col } from 'react-bootstrap';

class Home extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    constructor(props) {
        super(props);
        if (props.viewer) {
            this.state = {
            };
        }
    }

    render() {
        const viewer = this.props.viewer;
        if (!viewer) {
            return (
                <Grid>
                    <Row>
                        <Col xs={12}>
                            <h1>Hei</h1>
                            <p>På deg</p>
                        </Col>
                    </Row>
                </Grid>
            );
        }

        return (
            <Grid>
                <Row>
                    <Col xs={12}>
                        <h1>Hei</h1>
                        <p>Du har logga inn</p>
                    </Col>
                </Row>
            </Grid>
        );
    }
}
Home.propTypes = {
    viewer: React.PropTypes.object,
};

Home.childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(Home, {
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id,
            name,
            email,
        }
        `,
    },
});
