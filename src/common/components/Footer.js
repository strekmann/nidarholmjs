/* eslint "react/prop-types": 0 */

import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

export default ({ id }) => {
    return (
        <footer>
            <hr />
            <Grid>
                <Row>
                    <Col sm={9}>
                        { id ? <a href="/auth/logout">Logg ut</a> : null }
                    </Col>
                    <Col sm={3}>
                        Strekmann
                    </Col>
                </Row>
            </Grid>
        </footer>
    );
};
