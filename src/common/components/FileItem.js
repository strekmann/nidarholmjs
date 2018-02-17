import { Card, CardTitle, CardMedia, CardActions } from 'material-ui/Card';
import Chip from 'material-ui/Chip';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Dialog from 'material-ui/Dialog';
import Download from 'material-ui/svg-icons/file/file-download';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import { grey400 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import { flattenPermissions } from '../utils';
import theme from '../theme';

import PermissionChips from './PermissionChips';
import PermissionField from './PermissionField';
import TagField from './TagField';

class FileItem extends React.Component {
    static propTypes = {
        id: PropTypes.string.isRequired,
        filename: PropTypes.string.isRequired,
        // created: PropTypes.string.isRequired,
        // mimetype: PropTypes.string.isRequired,
        // size: PropTypes.number.isRequired,
        tags: PropTypes.array,
        permissions: PropTypes.object.isRequired,
        memberGroupId: PropTypes.string.isRequired,
        isImage: PropTypes.bool.isRequired,
        thumbnailPath: PropTypes.string.isRequired,
        path: PropTypes.string,
        onSavePermissions: PropTypes.func.isRequired,
        onSetProjectPoster: PropTypes.func,
        viewer: PropTypes.object,
        searchTag: PropTypes.func,
        organization: PropTypes.object,
    }

    state = {
        editPermissions: false,
        permissions: flattenPermissions(this.props.permissions),
        tags: this.props.tags || [],
    }

    onPermissionChange = (permissions) => {
        this.setState({ permissions });
    }

    onTagChange = (tags) => {
        this.setState({ tags });
    }

    setProjectPoster = () => {
        this.props.onSetProjectPoster(this.props.id);
    }

    savePermissions = (event) => {
        event.preventDefault();
        this.props.onSavePermissions(this.props.id, this.state.permissions, this.state.tags, () => {
            this.setState({
                editPermissions: false,
            });
        });
    }

    closeEditPermissions = () => {
        this.setState({
            editPermissions: false,
        });
    }

    toggleEditPermissions = () => {
        this.setState({
            editPermissions: !this.state.editPermissions,
        });
    }

    searchTag = (tag) => {
        this.props.searchTag(tag);
    }

    render() {
        const { desktopGutterLess } = theme.spacing;
        return (
            <Card
                key={this.props.id}
                style={{
                    width: 300,
                    marginLeft: desktopGutterLess,
                    marginRight: desktopGutterLess,
                    marginBottom: desktopGutterLess,
                }}
            >
                <CardTitle style={{ paddingBottom: 0 }}>
                    <div style={{ float: 'right' }}>
                        <IconMenu
                            iconButtonElement={
                                <IconButton
                                    style={{ padding: 0, height: 'inherit', width: 'inherit' }}
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            }
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Rediger filegenskaper"
                                onTouchTap={this.toggleEditPermissions}
                            />
                            {this.props.onSetProjectPoster
                                ? <MenuItem
                                    primaryText="Bruk som prosjektplakat"
                                    onTouchTap={this.setProjectPoster}
                                />
                                : null
                            }
                        </IconMenu>
                    </div>
                    <span
                        style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                        }}
                    >
                        {this.props.filename}
                    </span>
                </CardTitle>
                {this.props.isImage
                    ? <CardMedia><img alt="" src={this.props.thumbnailPath} /></CardMedia>
                    : (
                        <a
                            style={{ display: 'block', textAlign: 'center' }}
                            href={this.props.path}
                            download
                        >
                            <Download style={{ height: 100, width: '100%' }} color={grey400} />
                        </a>
                    )
                }
                <CardActions style={{ display: 'flex', flexWrap: 'wrap' }}>
                    <PermissionChips
                        memberGroupId={this.props.memberGroupId}
                        permissions={flattenPermissions(this.props.permissions)}
                    />
                    {this.props.tags && this.props.tags.map((tag) => {
                        return (
                            <Chip
                                key={tag}
                                onTouchTap={() => {
                                    this.searchTag(tag);
                                }}
                            >
                                {tag}
                            </Chip>
                        );
                    })}
                </CardActions>
                {this.state.editPermissions
                    ? (
                        <Dialog
                            title="Rediger rettigheter"
                            open={this.state.editPermissions}
                            onRequestClose={this.closeEditPermissions}
                            autoScrollBodyContent
                        >
                            <PermissionField
                                permissions={this.state.permissions}
                                onChange={this.onPermissionChange}
                                groups={this.props.viewer.groups}
                                users={this.props.viewer.friends}
                            />
                            <TagField
                                organization={this.props.organization}
                                onChange={this.onTagChange}
                                fileTags={this.state.tags}
                            />
                            <RaisedButton label="Lagre" onClick={this.savePermissions} primary />
                        </Dialog>
                    )
                    : null
                }
            </Card>
        );
    }
}

export default createFragmentContainer(
    FileItem,
    {
        organization: graphql`
        fragment FileItem_organization on Organization {
            ...TagField_organization
        }`,
    },
);
