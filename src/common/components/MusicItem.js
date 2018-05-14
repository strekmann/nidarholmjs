/* @flow */

import Link from 'found/lib/Link';
import IconButton from 'material-ui/IconButton';
import { ListItem } from 'material-ui/List';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import * as React from 'react';

type Props = {
    music: {
        id: string,
        piece: {
            id: string,
            title: string,
            composers: Array<string>,
        },
    },
    isMember: boolean,
    isMusicAdmin: boolean,
    remove: ({}) => void,
}

export default class MusicItem extends React.Component<Props> {
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
                        ? (
                            <IconButton
                                onClick={(event) => {
                                    event.preventDefault();
                                    this.props.remove(music.piece);
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        )
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
