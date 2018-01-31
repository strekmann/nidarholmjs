import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import PermissionField from './PermissionField';
import TagField from './TagField';

class FileUpload extends React.Component {
    static propTypes = {
        viewer: PropTypes.object,
        onDrop: PropTypes.func,
        memberGroupId: PropTypes.string,
        organization: PropTypes.object,
    }

    state = {
        permissions: [],
        tags: [],
    }

    onDrop = (files) => {
        const { permissions, tags } = this.state;
        this.props.onDrop(files, permissions, tags);
    }

    onPermissionChange = (permissions) => {
        this.setState({ permissions });
    }

    onTagChange = (tags) => {
        this.setState({ tags });
    }

    render() {
        const { viewer } = this.props;
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div
                    style={{ width: '50%', minWidth: 300, flexGrow: '1' }}
                >
                    <h3>1. Rettigheter og merkelapper</h3>
                    <div>Hvis du ikke endrer, er det bare du som kan se filene</div>
                    <PermissionField
                        permissions={this.state.permissions}
                        onChange={this.onPermissionChange}
                        groups={viewer.groups}
                        users={viewer.friends}
                        memberGroupId={this.props.memberGroupId}
                    />
                    <TagField
                        fileTags={this.state.tags}
                        onChange={this.onTagChange}
                        organization={this.props.organization}
                    />
                </div>
                <div
                    style={{ width: '50%', minWidth: 300, flexGrow: '1' }}
                >
                    <h3>2. Last opp</h3>
                    <p>Du kan dra filer til, eller klikke i firkanten</p>
                    <Dropzone
                        onDrop={this.onDrop}
                    />
                </div>
            </div>
        );
    }
}

export default createFragmentContainer(
    FileUpload,
    {
        organization: graphql`
        fragment FileUpload_organization on Organization {
            ...TagField_organization
        }`,
    },
);
