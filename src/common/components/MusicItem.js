import React from 'react';
import { Link } from 'react-router';

export default class MusicItem extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        piece: React.PropTypes.object,
        isMember: React.PropTypes.bool,
    }

    render() {
        const piece = this.props.piece;
        if (this.props.isMember) {
            return (
                <div>
                    <div>
                        <Link to={`/music/${piece.id}`}>
                            {piece.title} {piece.composers.map(composer => composer)}
                        </Link>
                    </div>
                </div>
            );
        }
        return (
            <div>
                <div>
                    {piece.title} {piece.composers.map(composer => composer)}
                </div>
            </div>
        );
    }
}
