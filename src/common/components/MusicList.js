import { List } from 'material-ui/List';
import React from 'react';
import MusicItem from './MusicItem';

export default class MusicList extends React.Component {
    static propTypes = {
        music: React.PropTypes.array,
        isMember: React.PropTypes.bool,
        isMusicAdmin: React.PropTypes.bool,
        remove: React.PropTypes.func,
    }
    render() {
        return (
            <List>
                {this.props.music.map((music) => {
                    return (
                        <MusicItem
                            key={music.id}
                            music={music}
                            isMember={this.props.isMember}
                            isMusicAdmin={this.props.isMusicAdmin}
                            remove={this.props.remove}
                        />
                    );
                })}
            </List>
        );
    }
}
