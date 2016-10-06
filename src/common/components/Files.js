import React from 'react';
import Relay from 'react-relay';
import Dropzone from 'react-dropzone';

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
        console.log("FA", files);
        files.forEach(file => {
            this.context.relay.commitUpdate(new AddFileMutation({
                viewer: null,
                organization: this.props.organization,
                file,
            }), {
                onSuccess: () => {
                    console.log("successfile");
                },
                onFailure: transaction => {
                    console.log(transaction.getError().source.errors);
                },
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
