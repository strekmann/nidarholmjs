import React from 'react';

class Project extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
    }

    render() {
        return (<h3>{this.props.title}</h3>);
    }
}

export default Project;
