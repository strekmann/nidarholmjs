import React from 'react';

import Date from './Date';

class Project extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
    }

    render() {
        return (
            <div>
                <a href={`/${this.props.year}/${this.props.tag}`}>
                    <h2>{this.props.title}</h2>
                </a>
                <div className="meta">
                    {this.props.start ? <span><Date date={this.props.start} /> – </span>: null}
                    <Date date={this.props.end} />
                </div>
                <div>
                    {this.props.mdtext}
                </div>
            </div>
        );
    }
}

export default Project;
