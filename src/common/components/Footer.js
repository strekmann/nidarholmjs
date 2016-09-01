/* eslint "react/prop-types": 0 */

import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';

export default ({ viewer, organization }) => {
    return (
        <footer>
            <hr />
            <Grid>
                <Row>
                    <Col sm={4}>
                        { viewer ? <a href="/auth/logout">Logg ut</a> : null }
                    </Col>
                    <Col sm={4}>
                        { organization.name }
                    </Col>
                </Row>
            </Grid>
        </footer>
    );
};
