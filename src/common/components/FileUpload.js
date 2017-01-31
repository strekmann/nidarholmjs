import React from 'react';
import Dropzone from 'react-dropzone';
import PermissionField from './PermissionField';

export default class FileUpload extends React.Component {
    static propTypes = {
        viewer: React.PropTypes.object,
        onDrop: React.PropTypes.func,
        memberGroupId: React.PropTypes.string,
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
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <div
                    style={{ width: '50%', minWidth: 300, flexGrow: '1' }}
                >
                    <h3>1. Rettigheter til de nye filene</h3>
                    <div>Hvis du ikke endrer, er det bare du som kan se filene</div>
                    <PermissionField
                        permissions={this.state.permissions}
                        onChange={this.onPermissionChange}
                        groups={viewer.groups}
                        users={viewer.friends}
                        memberGroupId={this.props.memberGroupId}
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
