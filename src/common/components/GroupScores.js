import React from 'react';
import IconButton from 'material-ui/IconButton';
import Download from 'material-ui/svg-icons/file/file-download';
import Close from 'material-ui/svg-icons/navigation/close';
import Dropzone from 'react-dropzone';
import { Link } from 'react-router';
import { List, ListItem } from 'material-ui/List';

export default class GroupScores extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        scores: React.PropTypes.array,
    }

    render() {
        const del = <IconButton><Close /></IconButton>;
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
                />
                <List>
                    {this.props.scores.map(
                        file => <Link
                            key={`${this.props.id}-${file.id}`}
                            href={file.path}
                            download
                        >
                            <ListItem
                                primaryText={file.filename}
                                leftIcon={<Download />}
                                rightIconButton={del}
                            />
                        </Link>
                        )
                    }
                </List>
            </div>
        );
    }
}
