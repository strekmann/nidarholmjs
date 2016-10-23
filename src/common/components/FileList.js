import React from 'react';

import FileItem from './FileItem';

export default class FileList extends React.Component {
    static propTypes = {
        files: React.PropTypes.object,
        memberGroupId: React.PropTypes.string,
        style: React.PropTypes.object,
        title: React.PropTypes.string,
    }
    render() {
        const style = this.props.style || {};
        style.display = 'flex';
        style.flexWrap = 'wrap';
        return (
            <div>
                {this.props.title
                    ? <h2>{this.props.title}</h2>
                    : null
                }
                <div style={style}>
                    {this.props.files.edges.map(edge => (
                        <FileItem
                            key={edge.node.id}
                            memberGroupId={this.props.memberGroupId}
                            {...edge.node}
                        />
                        ))
                    }
                </div>
            </div>
        );
    }
}
