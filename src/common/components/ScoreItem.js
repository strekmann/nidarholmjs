import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Download from 'material-ui/svg-icons/file/file-download';
import Close from 'material-ui/svg-icons/navigation/close';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

class ScoreItem extends React.Component {
    static propTypes = {
        file: PropTypes.object,
        groupscore: PropTypes.object,
        removeScore: PropTypes.func,
    }

    onDelete = (event) => {
        event.preventDefault();
        this.props.removeScore(this.props.file);
    }

    render() {
        const { file } = this.props;
        const del = (
            <IconButton onClick={this.onDelete}>
                <Close />
            </IconButton>
        );
        return (
            <a
                key={`${this.props.groupscore.id}-${file.id}`}
                href={file.path}
                download
            >
                <ListItem
                    primaryText={file.filename}
                    leftIcon={<Download />}
                    rightIconButton={del}
                />
            </a>
        );
    }
}
export default createFragmentContainer(
    ScoreItem,
    {
        file: graphql`
        fragment ScoreItem_file on File {
            id
            filename
            path
        }`,
    },
);
