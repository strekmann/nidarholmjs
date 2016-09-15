import React from 'react';

import Date from './Date';

class Project extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        end: React.PropTypes.string,
    }

    render() {
        return (
            <div>
                <h3>{this.props.title}</h3>
                <p><Date date={this.props.end} /></p>
            </div>
        );
    }
}

export default Project;
