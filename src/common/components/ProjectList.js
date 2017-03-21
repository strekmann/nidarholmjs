import React from 'react';
import Project from './ProjectItem';

export default class ProjectList extends React.Component {
    static propTypes = {
        projects: React.PropTypes.object,
    }
    render() {
        return (
            <div>
                {this.props.projects.edges.map((edge) => {
                    return (
                        <Project key={edge.node.id} {...edge.node} />
                    );
                })}
            </div>
        );
    }
}
