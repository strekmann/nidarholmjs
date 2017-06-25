/* global FormData */

import { List } from 'material-ui/List';
import axios from 'axios';
import PropTypes from 'prop-types';
import React from 'react';
import Dropzone from 'react-dropzone';
import Relay from 'react-relay';

import AddScoreMutation from '../mutations/addScore';
import RemoveScoreMutation from '../mutations/removeScore';

import ScoreItem from './ScoreItem';

class Groupscore extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        name: PropTypes.string,
        groupscore: PropTypes.object,
        piece: PropTypes.object,
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

    removeScore = (file) => {
        this.context.relay.commitUpdate(new RemoveScoreMutation({
            file,
            groupscore: this.props.groupscore,
            piece: this.props.piece,
        }));
    }

    render() {
        return (
            <div>
                <h3>{this.props.groupscore.name}</h3>
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
                                removeScore={this.removeScore}
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
                ${RemoveScoreMutation.getFragment('groupscore')}
            }`;
        },
    },
});
