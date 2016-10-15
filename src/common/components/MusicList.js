import React from 'react';

import MusicItem from './MusicItem';

export default class MusicList extends React.Component {
    static propTypes = {
        music: React.PropTypes.array,
        memberGroupId: React.PropTypes.string,
    }
    render() {
        return (
            <div>
                {this.props.music.map(music => (
                    <MusicItem
                        key={music.piece.id}
                        {...music}
                    />
                    ))
                }
            </div>
        );
    }
}
