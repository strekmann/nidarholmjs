/* eslint "react/no-danger": 0 */

import marked from '8fold-marked';
import PropTypes from 'prop-types';
import React from 'react';

export default class Text extends React.Component {
    static propTypes = {
        text: PropTypes.string,
    }

    render() {
        if (!this.props.text) {
            return null;
        }
        const text = marked(this.props.text);
        return (
            <span dangerouslySetInnerHTML={{ __html: text }} />
        );
    }
}
