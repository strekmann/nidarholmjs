import React from 'react';
import { Link } from 'react-router';
import Paper from 'material-ui/Paper';

import Date from './Date';
import Text from './Text';

export default class ProjectItem extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        publicMdtext: React.PropTypes.string,
        privateMdtext: React.PropTypes.string,
        poster: React.PropTypes.object,
    }

    render() {
        return (
            <Paper style={{ display: 'flex', marginBottom: 20 }}>
                <div style={{ width: this.props.poster ? '50%' : '100%', padding: '1rem 20px' }}>
                    <h2>
                        <Link to={`/${this.props.year}/${this.props.tag}`}>
                            {this.props.title}
                        </Link>
                    </h2>
                    <div className="meta">
                        {this.props.start ? <span><Date date={this.props.start} /> – </span> : null}
                        <Date date={this.props.end} />
                    </div>
                    <Text text={this.props.publicMdtext} />
                </div>
                {this.props.poster
                    ? <img
                        alt="Konsertplakat"
                        src={this.props.poster.normalPath}
                        style={{
                            display: 'inline-block',
                            width: '50%',
                            height: '100%',
                            maxWidth: 230,
                            padding: '0 0 0 20px',
                        }}
                    />
                    : null
                }
            </Paper>
        );
    }
}
