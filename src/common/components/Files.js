/* global FormData */
/* eslint "no-console": 0 */
/* @flow */

import * as React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import axios from 'axios';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';

import theme from '../theme';
import AddFileMutation from '../mutations/AddFile';
import SaveFilePermissionsMutation from '../mutations/SaveFilePermissions';

import FileList from './FileList';
import FileUpload from './FileUpload';
import TagField from './TagField';

type Props = {
    organization: {
        files: {
            pageInfo: {
                hasNextPage: bool,
            },
        },
        isMember: bool,
        memberGroup: {
            id: string,
        },
    },
    relay: {
        environment: {},
        refetch: (variables: {}) => {},
    },
    viewer: {},
}

type State = {
    addFile: bool,
    search: bool,
    tags: string[],
}

class Files extends React.Component<Props, State> {
    muiTheme: {};

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
        const { relay } = this.props;
        files.forEach((file) => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
                .then((response) => {
                    AddFileMutation.commit(relay.environment, {
                        filename: file.name,
                        hex: response.data.hex,
                        permissions: permissions.map((permission) => {
                            return permission.id;
                        }),
                        projectTag: null,
                        tags,
                    });
                })
                .catch((error) => {
                    console.error('err', error);
                });
        });
    }

    onSaveFilePermissions = (file, permissions, tags, onSuccess) => {
        const { relay } = this.props;
        SaveFilePermissionsMutation.commit(relay.environment, {
            fileId: file,
            permissions: permissions.map((permission) => {
                return permission.id;
            }),
            tags,
        }, onSuccess);
    }

    onTagChange = (tags) => {
        this.setState({ tags });
        this.props.relay.refetch((variables) => {
            return {
                showFiles: variables.showFiles,
                searchTerm: variables.searchTerm,
                searchTags: tags.sort().join('|').toLowerCase(),
            };
        });
    }

    onChangeTerm = (searchTerm) => {
        this.props.relay.refetch((variables) => {
            return {
                showFiles: variables.showFiles,
                searchTags: variables.searchTags,
                searchTerm,
            };
        });
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
        // const fixedTags = tags.sort().join('|').toLowerCase();
        const { tags } = this.state;
        tags.push(tag);
        this.props.relay.refetch((variables) => {
            this.setState({
                search: true,
                tags,
            });
            return {
                showFiles: variables.showFiles,
                searchTerm: variables.searchTerm,
                searchTags: this.state.tags.sort().join('|').toLowerCase(),
            };
        });
    }

    fetchMore = () => {
        this.props.relay.refetch((variables) => {
            return {
                showFiles: variables.showFiles + 20,
                searchTags: this.state.tags.sort().join('|').toLowerCase(),
                searchTerm: variables.searchTerm,
            };
        });
    }

    render() {
        const { organization } = this.props;
        const { isMember } = organization;
        const { desktopGutterLess } = theme.spacing;
        return (
            <div className="row">
                {isMember
                    ? (
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
                                    memberGroupId={organization.memberGroup.id}
                                    onTagsChange={this.searchTag}
                                />
                                <RaisedButton label="Ferdig" primary onTouchTap={this.closeAddFile} />
                            </Dialog>
                        </div>
                    )
                    : null
                }
                <h1>Filer</h1>
                {this.state.search
                    ? (
                        <Paper
                            style={{
                                padding: desktopGutterLess,
                                marginBottom: desktopGutterLess,
                            }}
                        >
                            <h2>Søk i merkelapper</h2>
                            <TagField
                                autoFocus
                                fileTags={this.state.tags}
                                onChange={this.onTagChange}
                                organization={this.props.organization}
                            />
                        </Paper>
                    )
                    : null
                }
                <FileList
                    files={organization.files}
                    memberGroupId={organization.memberGroup.id}
                    onSavePermissions={this.onSaveFilePermissions}
                    searchTag={this.searchTag}
                    style={{
                        marginLeft: -desktopGutterLess,
                        marginRight: -desktopGutterLess,
                    }}
                    viewer={this.props.viewer}
                    organization={this.props.organization}
                />
                {organization.files.pageInfo.hasNextPage
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

export default createRefetchContainer(
    Files,
    {
        viewer: graphql`
        fragment Files_viewer on User {
            groups {
                id
                name
            }
        }`,
        organization: graphql`
        fragment Files_organization on Organization
        @argumentDefinitions(
            showFiles: {type: "Int", defaultValue: 20}
            searchTags: {type: "String", defaultValue: ""}
            searchTerm: {type: "String", defaultValue: ""}
        ) {
            id
            isMember
            memberGroup {
                id
            }
            files(first: $showFiles, tags: $searchTags) {
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
            ...FileList_organization
            ...FileUpload_organization
            ...TagField_organization
        }`,
    },
    graphql`
    query FilesRefetchQuery($showFiles: Int, $searchTags: String) {
        organization {
            ...Files_organization @arguments(showFiles: $showFiles, searchTags: $searchTags)
        }
    }`,
);
