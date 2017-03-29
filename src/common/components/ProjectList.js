import React from 'react';

import ProjectItem from './ProjectItem';

export default class ProjectList extends React.Component {
    static propTypes = {
        projects: React.PropTypes.object,
    }
    render() {
        return (
            <div>
                {this.props.projects.edges.map((edge) => {
                    return (
                        <ProjectItem key={edge.node.id} {...edge.node} />
                    );
                })}
            </div>
        );
    }
}
