import marked from 'marked';
import React from 'react';

export default class Text extends React.Component {
    static propTypes = {
        text: React.PropTypes.string,
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
