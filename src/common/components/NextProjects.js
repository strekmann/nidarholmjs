import React from 'react';
import Project from './Project';

class NextProjects extends React.Component {
    static propTypes = {
        projects: React.PropTypes.array,
    }
    render() {
        if (!this.props.projects.length) {
            return null;
        }
        return (
            <div>
                <h2>Neste prosjekter</h2>
                {this.props.projects.map(project => <Project {...project} />)}
            </div>
        );
    }
}

export default NextProjects;
