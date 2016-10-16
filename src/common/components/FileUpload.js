import React from 'react';
import Dropzone from 'react-dropzone';

import Paper from 'material-ui/Paper';

import PermissionField from './PermissionField';

export default class FileUpload extends React.Component {
    static propTypes = {
        viewer: React.PropTypes.object,
        onDrop: React.PropTypes.func,
    }

    onDrop = (files) => {
        const permissions = this.permissions.value;
        this.props.onDrop(files, permissions);
    }

    render() {
        const viewer = this.props.viewer;
        return (
            <Paper>
                <PermissionField
                    ref={(p) => { this.permissions = p; }}
                    groups={viewer.groups}
                    users={viewer.friends}
                />
                <Dropzone onDrop={this.onDrop} />
            </Paper>
        );
    }
}
