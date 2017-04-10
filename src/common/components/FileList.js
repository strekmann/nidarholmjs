/* eslint "react/require-default-props": 0 */

import React from 'react';
import Relay from 'react-relay';

import FileItem from './FileItem';

class FileList extends React.Component {
    static propTypes = {
        files: React.PropTypes.object,
        memberGroupId: React.PropTypes.string,
        style: React.PropTypes.object,
        title: React.PropTypes.string,
        onSavePermissions: React.PropTypes.func,
        onSetProjectPoster: React.PropTypes.func,
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
        searchTag: React.PropTypes.func,
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
                    {this.props.files.edges.map((edge) => {
                        return (
                            <FileItem
                                key={edge.node.id}
                                memberGroupId={this.props.memberGroupId}
                                onSavePermissions={this.props.onSavePermissions}
                                onSetProjectPoster={this.props.onSetProjectPoster}
                                viewer={this.props.viewer}
                                searchTag={this.props.searchTag}
                                organization={this.props.organization}
                                {...edge.node}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
}

export default Relay.createContainer(FileList, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                ${FileItem.getFragment('organization')}
            }`;
        },
    },
});
