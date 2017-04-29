/* global FormData */

import { List } from 'material-ui/List';
import axios from 'axios';
import React from 'react';
import Dropzone from 'react-dropzone';
import Relay from 'react-relay';

import AddScoreMutation from '../mutations/addScore';

import ScoreItem from './ScoreItem';

class Groupscore extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        name: React.PropTypes.string,
        groupscore: React.PropTypes.object,
        piece: React.PropTypes.object,
    }

    onDrop = (files) => {
        this.uploadScores(files, this.props.groupscore);
    }

    uploadScores = (files, groupscore) => {
        files.forEach((file) => {
            const data = new FormData();
            data.append('file', file);

            axios.post('/upload', data)
            .then((response) => {
                this.context.relay.commitUpdate(new AddScoreMutation({
                    hex: response.data.hex,
                    filename: file.name,
                    groupscore,
                    piece: this.props.piece,
                }));
            });
        });
    }

    render() {
        return (
            <div>
                <h3>{this.props.name}</h3>
                <Dropzone
                    style={{
                        minWidth: 300,
                        minHeight: 50,
                        borderWidth: 2,
                        borderColor: '#666',
                        borderStyle: 'dashed',
                        borderRadius: 5,
                    }}
                    onDrop={this.onDrop}
                />
                <List>
                    {this.props.groupscore.files.edges.map((edge) => {
                        const file = edge.node;
                        return (
                            <ScoreItem
                                file={file}
                                groupscore={this.props.groupscore}
                                key={file.id}
                            />
                        );
                    })}
                </List>
            </div>
        );
    }
}

export default Relay.createContainer(Groupscore, {
    fragments: {
        groupscore: () => {
            return Relay.QL`
            fragment on Groupscore {
                id
                name
                files {
                    edges {
                        node {
                            id
                            ${ScoreItem.getFragment('file')}
                        }
                    }
                }
                ${AddScoreMutation.getFragment('groupscore')}
            }`;
        },
    },
});
