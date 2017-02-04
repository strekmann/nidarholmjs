/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import axios from 'axios';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import Paper from 'material-ui/Paper';

import theme from '../theme';
import FileList from './FileList';
import FileUpload from './FileUpload';
import TagField from './TagField';
import AddFileMutation from '../mutations/addFile';
import SaveFilePermissionsMutation from '../mutations/saveFilePermissions';

const itemsPerPage = 12;

class Files extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
        relay: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        addFile: false,
        search: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onDrop = (files, permissions) => {
        files.forEach(file => {
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
                }), {
                    onSuccess: () => {
                        // console.log("successfile");
                    },
                    onFailure: transaction => {
                        console.error(transaction.getError().source.errors);
                    },
                });
            })
            .catch(error => {
                console.error('err', error);
            });
        });
    }

    onSaveFilePermissions = (file, permissions, onSuccess) => {
        this.context.relay.commitUpdate(new SaveFilePermissionsMutation({
            organization: this.props.organization,
            fileId: file,
            permissions: permissions.map(permission => permission.id),
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
        const tags = this.props.relay.variables.tags.split('|');
        tags.push(tag);
        const fixedTags = tags.sort().join('|').toLowerCase();
        this.props.relay.setVariables({ tags: fixedTags });
        this.setState({ search: true });
    }

    fetchMore = () => {
        this.props.relay.setVariables({
            showFiles: this.props.relay.variables.showFiles + itemsPerPage,
        });
    }

    render() {
        const org = this.props.organization;
        const isMember = org.isMember;
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
                                onDrop={this.onDrop}
                                memberGroupId={org.memberGroup.id}
                            />
                            <RaisedButton label="Ferdig" primary onTouchTap={this.closeAddFile} />
                        </Dialog>
                    </div>
                : null}
                <h1>Filer</h1>
                {this.state.search
                        ? <Paper style={{ padding: 20, marginBottom: 20 }}>
                            <h2>Søk i merkelapper</h2>
                            <TagField
                                tags={this.props.relay.variables.tags}
                                onChange={this.onTagChange}
                                allTags={this.props.organization.tags}
                                onChangeTerm={this.onChangeTerm}
                                term={this.props.relay.variables.term}
                            />
                        </Paper>
                        : null
                }
                <FileList
                    files={org.files}
                    memberGroupId={org.memberGroup.id}
                    onSavePermissions={this.onSaveFilePermissions}
                    searchTag={this.searchTag}
                    style={{ margin: '0 -20px' }}
                    viewer={this.props.viewer}
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
        viewer: () => Relay.QL`
        fragment on User {
            groups {
                id
                name
            }
        }
        `,
        organization: () => Relay.QL`
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
            ${AddFileMutation.getFragment('organization')},
            ${SaveFilePermissionsMutation.getFragment('organization')}
        }`,
    },
});
