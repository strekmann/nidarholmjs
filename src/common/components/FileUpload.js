import React from 'react';
import Dropzone from 'react-dropzone';

import Paper from 'material-ui/Paper';

import PermissionField from './PermissionField';

export default class FileUpload extends React.Component {
    static propTypes = {
        viewer: React.PropTypes.object,
        onDrop: React.PropTypes.func,
    }

    state = {
        permissions: [],
    }

    onDrop = (files) => {
        const permissions = this.state.permissions;
        this.props.onDrop(files, permissions);
    }

    onPermissionChange = (permissions) => {
        this.setState({ permissions });
    }

    render() {
        const viewer = this.props.viewer;
        return (
            <Paper>
                <PermissionField
                    permissions={this.state.permissions}
                    onChange={this.onPermissionChange}
                    groups={viewer.groups}
                    users={viewer.friends}
                />
                <Dropzone onDrop={this.onDrop} />
            </Paper>
        );
    }
}
