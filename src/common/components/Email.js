import marked from 'marked';
import React from 'react';
import { renderToString } from 'react-dom/server';

export default class Email extends React.Component {
    static propTypes = {
        email: React.PropTypes.string,
        children: React.PropTypes.element,
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
                        __html: `<a href=${email}>${renderToString(this.props.children)}`,
                    }}
                />);
        }
        const email = marked(`<${this.props.email}>`);
        return (
            <span dangerouslySetInnerHTML={{ __html: email }} />
        );
    }
}

