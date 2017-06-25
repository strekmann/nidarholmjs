import PropTypes from 'prop-types';
import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        value: PropTypes.bool,
        yes: PropTypes.string,
        no: PropTypes.string,
        maybe: PropTypes.string,
    }

    render() {
        const yes = this.props.yes || 'ja';
        const no = this.props.no || 'nei';
        const maybe = this.props.maybe || 'kanskje';
        if (this.props.value) {
            return <span>{yes}</span>;
        }
        if (this.props.value === undefined || this.props.value === null) {
            return <span>{maybe}</span>;
        }
        return <span>{no}</span>;
    }
}
