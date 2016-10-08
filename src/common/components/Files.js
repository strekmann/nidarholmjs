/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import Dropzone from 'react-dropzone';
import axios from 'axios';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import AutoComplete from 'material-ui/AutoComplete';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';

import theme from '../theme';
import FileList from './FileList';
import PermissionItem from './PermissionItem';
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

    state = {
        permissions: [],
        permission: '',
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onDrop = (files) => {
        files.forEach(file => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new AddFileMutation({
                    viewer: null,
                    organization: this.props.organization,
                    hex: response.data.hex,
                    permissions: this.state.permissions.map(permission => permission.value),
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

    onPermissionChange = (value) => {
        this.setState({
            permission: value,
        });
    }

    addPermission = (chosen) => {
        const permissions = this.state.permissions;
        permissions.push(chosen);
        this.setState({
            permissions,
            permission: '',
        });
    }

    removePermission = (permissionId) => {
        const permissions = this.state.permissions.filter(_p => _p.value !== permissionId);
        this.setState({
            permissions,
        });
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        const permissions = [];
        if (viewer) {
            permissions.push({ value: 'p', text: 'Verden' });
            viewer.groups.forEach(group => {
                permissions.push({ value: group.id, text: group.name });
            });
        }
        return (
            <section>
                <h1>Filer</h1>
                {viewer ?
                    <Paper>
                        {this.state.permissions.length ?
                            <div>
                                <List>
                                    <Subheader>Rettigheter</Subheader>
                                    {
                                        this.state.permissions.map(
                                            permission => <PermissionItem
                                                key={permission.value}
                                                removePermission={this.removePermission}
                                                {...permission}
                                            />
                                            )
                                    }
                                </List>
                            </div>
                        : null}

                        <AutoComplete
                            id="permissions"
                            floatingLabelText="Legg til rettigheter"
                            filter={AutoComplete.fuzzyFilter}
                            dataSource={permissions}
                            maxSearchResults={8}
                            searchText={this.state.permission}
                            onNewRequest={this.addPermission}
                            onUpdateInput={this.onPermissionChange}
                        />
                        <Dropzone onDrop={this.onDrop} />
                    </Paper>
                : null}
                <FileList
                    files={org.files}
                    memberGroupId={org.member_group.id}
                />
                {org.files.pageInfo.hasNextPage ?
                    <RaisedButton primary>Mer</RaisedButton>
                    :
                    null
                }
            </section>
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
                            users
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
        }`,
    },
});
