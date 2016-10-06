/* global FormData */

import React from 'react';
import Relay from 'react-relay';
import Dropzone from 'react-dropzone';
import axios from 'axios';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';

import theme from '../theme';
import FileList from './FileList';
import AddFileMutation from '../mutations/addFile';

const itemsPerPage = 10;

class Files extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
        relay: {
            setVariables: React.PropTypes.func,
        },
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
        const org = this.props.organization;
        return (
            <section>
                <h1>Filer</h1>
                <Dropzone onDrop={this.onDrop} />
                <FileList
                    files={org.files}
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
        organization: () => Relay.QL`
        fragment on Organization {
            id
            files(first:$showFiles) {
                edges {
                    node {
                        id
                        filename
                        created
                        mimetype
                        size
                        tags
                        is_image
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
        }`,
    },
});
