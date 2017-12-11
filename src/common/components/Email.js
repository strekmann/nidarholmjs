/* eslint "react/no-danger": 0 */

import marked from '8fold-marked';
import PropTypes from 'prop-types';
import React from 'react';
import { renderToString } from 'react-dom/server';

export default class Email extends React.Component {
    static propTypes = {
        email: PropTypes.string,
        children: PropTypes.element,
    }

    render() {
        if (!this.props.email) {
            return null;
        }
        if (this.props.children) {
            const inlineLexer = new marked.InlineLexer([]);
            const email = inlineLexer.mangle(`mailto:${this.props.email}`);
            return (
                <span
                    dangerouslySetInnerHTML={{
                        __html: `<a href=${email} className="noMargins">${renderToString(this.props.children)}</a>`,
                    }}
                />);
        }
        const email = marked(`<${this.props.email}>`);
        return (
            <span dangerouslySetInnerHTML={{ __html: email }} className="noMargins" />
        );
    }
}
