/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import axios from 'axios';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';

import theme from '../theme';
import FileList from './FileList';
import FileUpload from './FileUpload';
import AddFileMutation from '../mutations/addFile';

const itemsPerPage = 10;

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
                console.error("err", error);
            });
        });
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        const isMember = org.is_member;
        return (
            <div className="row">
                <h1>Filer</h1>
                {isMember ?
                    <FileUpload
                        viewer={this.props.viewer}
                        onDrop={this.onDrop}
                    />
                : null}
                <FileList
                    files={org.files}
                    memberGroupId={org.member_group.id}
                    style={{ margin: '0 -20px' }}
                />
                {org.files.pageInfo.hasNextPage ?
                    <RaisedButton primary>Mer</RaisedButton>
                    :
                    null
                }
            </div>
        );
    }
}

export default Relay.createContainer(Files, {
    initialVariables: {
        showFiles: itemsPerPage,
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
            is_member
            member_group {
                id
            }
            files(first:$showFiles) {
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
                        is_image
                        normal_path
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
            ${AddFileMutation.getFragment('organization')},
        }`,
    },
});
