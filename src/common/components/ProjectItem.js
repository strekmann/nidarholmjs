import React from 'react';
import { Link } from 'react-router';

import Date from './Date';
import Text from './Text';

class Project extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
        mdtext: React.PropTypes.string,
    }

    render() {
        return (
            <div>
                <h2>
                    <Link to={`/${this.props.year}/${this.props.tag}`}>
                        {this.props.title}
                    </Link>
                </h2>
                <div className="meta">
                    {this.props.start ? <span><Date date={this.props.start} /> – </span> : null}
                    <Date date={this.props.end} />
                </div>
                <Text text={this.props.public_mdtext} />
                {this.props.poster ? <img src={this.props.poster.thumbnail_path} /> : null }
            </div>
        );
    }
}

export default Project;
