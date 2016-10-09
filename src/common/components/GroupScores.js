import React from 'react';
import FlatButton from 'material-ui/FlatButton';

export default class GroupScores extends React.Component {
    static propTypes = {
        id: React.PropTypes.string,
        name: React.PropTypes.string,
        scores: React.PropTypes.array,
    }

    render() {
        return (
            <div>
                <h3>{this.props.name}</h3>
                <div>
                    {this.props.scores.map(
                        file => <div key={`${this.props.id}-${file.id}`}>
                            <FlatButton href={file.path} label={file.filename} />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
