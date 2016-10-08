import React from 'react';

import FileItem from './FileItem';

export default class FileList extends React.Component {
    static propTypes = {
        files: React.PropTypes.object,
        memberGroupId: React.PropTypes.string,
    }
    render() {
        return (
            <div>
                {this.props.files.edges.map(edge => (
                    <FileItem
                        key={edge.node.id}
                        memberGroupId={this.props.memberGroupId}
                        {...edge.node}
                    />
                    ))
                }
            </div>
        );
    }
}
