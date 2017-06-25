import PropTypes from 'prop-types';
import React from 'react';

export default class List extends React.Component {
    static propTypes = {
        items: PropTypes.array.isRequired,
    }

    render() {
        const items = this.props.items;
        const and = 'og';
        if (!items || items.length === 0) {
            return <span />;
        }
        if (items.length === 1) {
            return <span>{items[0]}</span>;
        }
        if (items.length === 2) {
            return <span>{items[0]} {and} {items[1]}</span>;
        }
        return <span>{items.slice(0, -1).join(', ')} {and} {items[items.length - 1]}</span>;
    }
}
