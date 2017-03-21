import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import React from 'react';
import { Link } from 'react-router';

export default class MusicItem extends React.Component {
    static propTypes = {
        music: React.PropTypes.object,
        isMember: React.PropTypes.bool,
        isMusicAdmin: React.PropTypes.bool,
        remove: React.PropTypes.func,
    }

    render() {
        const { music } = this.props;
        if (this.props.isMember) {
            return (
                <ListItem
                    key={music.id}
                    primaryText={music.piece.title}
                    secondaryText={music.piece.composers}
                    containerElement={<Link to={`/music/${music.piece.id}`} />}
                    rightIconButton={this.props.isMusicAdmin
                        ? <IconButton
                            onClick={(event) => {
                                event.preventDefault();
                                this.props.remove(music.piece);
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        : null
                    }
                />
            );
        }
        return (
            <ListItem
                disabled
                primaryText={music.piece.title}
                secondaryText={music.piece.composers}
            />
        );
    }
}
