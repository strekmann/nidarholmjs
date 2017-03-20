import React from 'react';

import MusicItem from './MusicItem';

export default class MusicList extends React.Component {
    static propTypes = {
        music: React.PropTypes.array,
        isMember: React.PropTypes.bool,
    }
    render() {
        return (
            <div>
                {this.props.music.map((music) => {
                    return (
                        <MusicItem
                            key={music.piece.id}
                            isMember={this.props.isMember}
                            {...music}
                        />
                    );
                })}
            </div>
        );
    }
}
