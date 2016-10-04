import marked from 'marked';
import React from 'react';

export default class Email extends React.Component {
    static propTypes = {
        email: React.PropTypes.string,
    }

    render() {
        if (!this.props.email) {
            return null;
        }
        const email = marked(`<${this.props.email}>`);
        return (
            <span dangerouslySetInnerHTML={{ __html: email }} />
        );
    }
}

