import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import Download from 'material-ui/svg-icons/file/file-download';
import Close from 'material-ui/svg-icons/navigation/close';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';

class ScoreItem extends React.Component {
    static propTypes = {
        groupscore: React.PropTypes.object,
        file: React.PropTypes.object,
    }

    /*
    onDelete = () => {
        this.context.relay.commitUpdate(new RemoveFileMutation({
            groupId: this.props.groupId,
            fileId: this.props.scoreItem.id,
        }));
    }
    */

    render() {
        const { file } = this.props;
        const del = (
            <IconButton onClick={this.onDelete}>
                <Close />
            </IconButton>
        );
        return (
            <Link
                key={`${this.props.groupscore.id}-${file.id}`}
                href={file.path}
                download
            >
                <ListItem
                    primaryText={file.filename}
                    leftIcon={<Download />}
                    rightIconButton={del}
                />
            </Link>
        );
    }
}
export default Relay.createContainer(ScoreItem, {
    fragments: {
        file: () => {
            return Relay.QL`
            fragment on File {
                id
                filename
                path
            }`;
            // ${RemoveFileMutation.getFragment('file')}
        },
    },
});
