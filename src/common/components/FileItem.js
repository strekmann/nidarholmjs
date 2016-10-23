import React from 'react';
import { Link } from 'react-router';
import { Card, CardTitle, CardText, CardMedia } from 'material-ui/Card';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Dialog from 'material-ui/Dialog';
import Download from 'material-ui/svg-icons/file/file-download';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { grey400 } from 'material-ui/styles/colors';
import PermissionChips from './PermissionChips';
import PermissionField from './PermissionField';
import { flattenPermissions } from '../utils';

export default class FileItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        filename: React.PropTypes.string,
        created: React.PropTypes.string,
        mimetype: React.PropTypes.string,
        size: React.PropTypes.number,
        tags: React.PropTypes.array,
        permissions: React.PropTypes.object.isRequired,
        memberGroupId: React.PropTypes.string,
        is_image: React.PropTypes.bool,
        normal_path: React.PropTypes.string,
        path: React.PropTypes.string,
        onSavePermissions: React.PropTypes.func.isRequired,
        onSetProjectPoster: React.PropTypes.func,
        viewer: React.PropTypes.object,
    }

    state = {
        editPermissions: false,
        permissions: flattenPermissions(this.props.permissions),
    }

    onPermissionChange = (permissions) => {
        this.setState({ permissions });
    }

    toggleEditPermissions = () => {
        this.setState({
            editPermissions: !this.state.editPermissions,
        });
    }

    closeEditPermissions = () => {
        this.setState({
            editPermissions: false,
        });
    }

    savePermissions = (event) => {
        event.preventDefault();
        this.props.onSavePermissions(this.props.id, this.state.permissions, () => {
            this.setState({
                editPermissions: false,
            });
        });
    }

    setProjectPoster = () => {
        this.props.onSetProjectPoster(this.props.id);
    }

    render() {
        return (
            <Card key={this.props.id} style={{ width: 200, margin: '0 15px 15px 15px' }} >
                <CardTitle>
                    <div style={{ float: 'right' }}>
                        <IconMenu
                            iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Rediger rettigheter"
                                onTouchTap={this.toggleEditPermissions}
                            />
                            <MenuItem
                                primaryText="Bruk som prosjektplakat"
                                onTouchTap={this.setProjectPoster}
                            />
                        </IconMenu>
                    </div>
                    <Link
                        style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            width: 120,
                            display: 'inline-block',
                        }}
                    >
                        {this.props.filename}
                    </Link>
                </CardTitle>
                {this.props.is_image
                    ? <CardMedia><img alt="" src={this.props.normal_path} /></CardMedia>
                    : <Link
                        style={{ display: 'block', textAlign: 'center' }}
                        href={this.props.path}
                        download
                    >
                        <Download style={{ height: 100, width: '100%' }} color={grey400} />
                    </Link>
                    }
                <CardText>
                    <PermissionChips
                        memberGroupId={this.props.memberGroupId}
                        permissions={flattenPermissions(this.props.permissions)}
                    />
                </CardText>
                {this.state.editPermissions
                    ? <Dialog
                        title="Rediger rettigheter"
                        open={this.state.editPermissions}
                        onRequestClose={this.closeEditPermissions}
                    >
                        <PermissionField
                            permissions={this.state.permissions}
                            onChange={this.onPermissionChange}
                            groups={this.props.viewer.groups}
                            users={this.props.viewer.friends}
                        />
                        <RaisedButton label="Lagre" onClick={this.savePermissions} />
                    </Dialog>
                    : null
                }
            </Card>
        );
    }
}
