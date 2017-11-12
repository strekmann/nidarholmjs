/* eslint "react/require-default-props": 0 */

import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import FileItem from './FileItem';

class FileList extends React.Component {
    static propTypes = {
        files: PropTypes.object,
        memberGroupId: PropTypes.string,
        style: PropTypes.object,
        title: PropTypes.string,
        onSavePermissions: PropTypes.func,
        onSetProjectPoster: PropTypes.func,
        viewer: PropTypes.object,
        organization: PropTypes.object,
        searchTag: PropTypes.func,
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

export default createFragmentContainer(
    FileList,
    {
        organization: graphql`
        fragment FileList_organization on Organization {
            ...FileItem_organization
        }`,
    },
);
