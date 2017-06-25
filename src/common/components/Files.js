/* global FormData */
/* eslint "no-console": 0 */

import React from 'react';
import Relay from 'react-relay';
import axios from 'axios';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';

import theme from '../theme';
import AddFileMutation from '../mutations/addFile';
import SaveFilePermissionsMutation from '../mutations/saveFilePermissions';

import FileList from './FileList';
import FileUpload from './FileUpload';
import TagField from './TagField';

const itemsPerPage = 12;

class Files extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: PropTypes.object,
        organization: PropTypes.object,
        relay: PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        addFile: false,
        search: false,
        tags: [],
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onDrop = (files, permissions, tags) => {
        files.forEach((file) => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new AddFileMutation({
                    viewer: null,
                    organization: this.props.organization,
                    hex: response.data.hex,
                    permissions,
                    filename: file.name,
                    projectTag: null,
                    tags,
                }), {
                    onSuccess: () => {
                        // console.log("successfile");
                    },
                    onFailure: (transaction) => {
                        console.error(transaction.getError().source.errors);
                    },
                });
            })
            .catch((error) => {
                console.error('err', error);
            });
        });
    }

    onSaveFilePermissions = (file, permissions, tags, onSuccess) => {
        this.context.relay.commitUpdate(new SaveFilePermissionsMutation({
            organization: this.props.organization,
            fileId: file,
            permissions: permissions.map((permission) => {
                return permission.id;
            }),
            tags,
        }), {
            onSuccess,
        });
    }

    onTagChange = (tags) => {
        const fixedTags = tags.sort().join('|').toLowerCase();
        this.props.relay.setVariables({ tags: fixedTags });
    }

    onChangeTerm = (term) => {
        this.props.relay.setVariables({ term });
    }

    toggleAddFile = () => {
        this.setState({ addFile: !this.state.addFile });
    }

    closeAddFile = () => {
        this.setState({ addFile: false });
    }

    toggleSearch = () => {
        this.setState({ search: !this.state.search });
    }

    searchTag = (tag) => {
        const tags = this.props.relay.variables.tags.split('|').filter((t) => {
            return !!t;
        });
        tags.push(tag);
        const fixedTags = tags.sort().join('|').toLowerCase();
        this.props.relay.setVariables({ tags: fixedTags });
        this.setState({ search: true, tags });
    }

    fetchMore = () => {
        this.props.relay.setVariables({
            showFiles: this.props.relay.variables.showFiles + itemsPerPage,
        });
    }

    render() {
        const org = this.props.organization;
        const isMember = org.isMember;
        const { desktopGutterLess } = theme.spacing;
        return (
            <div className="row">
                {isMember ?
                    <div style={{ float: 'right' }}>
                        <RaisedButton
                            label="Last opp filer"
                            onTouchTap={this.toggleAddFile}
                        />
                        <RaisedButton
                            label="Søk"
                            onTouchTap={this.toggleSearch}
                        />
                        <Dialog
                            title="Last opp filer"
                            open={this.state.addFile}
                            onRequestClose={this.closeAddFile}
                            autoScrollBodyContent
                        >
                            <FileUpload
                                viewer={this.props.viewer}
                                organization={this.props.organization}
                                onDrop={this.onDrop}
                                memberGroupId={org.memberGroup.id}
                                onTagsChange={this.searchTag}
                            />
                            <RaisedButton label="Ferdig" primary onTouchTap={this.closeAddFile} />
                        </Dialog>
                    </div>
                : null}
                <h1>Filer</h1>
                {this.state.search
                        ? <Paper
                            style={{
                                padding: desktopGutterLess,
                                marginBottom: desktopGutterLess,
                            }}
                        >
                            <h2>Søk i merkelapper</h2>
                            <TagField
                                onChange={this.onTagChange}
                                organization={this.props.organization}
                                autoFocus
                            />
                        </Paper>
                        : null
                }
                <FileList
                    files={org.files}
                    memberGroupId={org.memberGroup.id}
                    onSavePermissions={this.onSaveFilePermissions}
                    searchTag={this.searchTag}
                    style={{
                        marginLeft: desktopGutterLess,
                        marginRight: desktopGutterLess,
                    }}
                    viewer={this.props.viewer}
                    organization={this.props.organization}
                />
                {org.files.pageInfo.hasNextPage
                        ? <RaisedButton
                            onTouchTap={this.fetchMore}
                            label="Mer"
                            primary
                        />
                        : null
                }
            </div>
        );
    }
}

export default Relay.createContainer(Files, {
    initialVariables: {
        showFiles: itemsPerPage,
        tags: '',
        term: '',
    },
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                groups {
                    id
                    name
                }
            }`;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                isMember
                memberGroup {
                    id
                }
                tags(tags:$tags, term:$term) {
                    tag
                    count
                }
                files(first:$showFiles, tags:$tags) {
                    edges {
                        node {
                            id
                            filename
                            created
                            mimetype
                            size
                            permissions {
                                public
                                groups {
                                    id
                                    name
                                }
                                users {
                                    id
                                    name
                                }
                            }
                            tags
                            isImage
                            path
                            thumbnailPath
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
                ${FileList.getFragment('organization')}
                ${FileUpload.getFragment('organization')}
                ${TagField.getFragment('organization')}
                ${AddFileMutation.getFragment('organization')},
                ${SaveFilePermissionsMutation.getFragment('organization')}
            }`;
        },
    },
});
