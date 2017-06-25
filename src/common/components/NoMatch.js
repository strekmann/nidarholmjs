import PropTypes from 'prop-types';
import React from 'react';

export default class NoMatch extends React.Component {
    static propTypes = {
        date: PropTypes.node,
    }

    render() {
        return (
            <h1>Not found!</h1>
        );
    }
}
