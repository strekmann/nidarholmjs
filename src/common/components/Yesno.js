import React from 'react';

export default class Date extends React.Component {
    static propTypes = {
        value: React.PropTypes.bool,
        yes: React.PropTypes.string,
        no: React.PropTypes.string,
        maybe: React.PropTypes.string,
    }

    render() {
        const yes = this.props.yes || 'ja';
        const no = this.props.no || 'nei';
        const maybe = this.props.no || 'kanskje';
        if (this.props.value) {
            return <span>{yes}</span>;
        }
        if (this.props.value === undefined || this.props.value === null) {
            return <span>{maybe}</span>;
        }
        return <span>{no}</span>;
    }
}
