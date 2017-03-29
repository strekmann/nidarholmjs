import React from 'react';
import { Link } from 'react-router';
import Paper from 'material-ui/Paper';
import moment from 'moment';

import theme from '../theme';

import Daterange from './Daterange';
import Text from './Text';

export default class ProjectItem extends React.Component {
    static propTypes = {
        title: React.PropTypes.string,
        start: React.PropTypes.string,
        end: React.PropTypes.string,
        tag: React.PropTypes.string,
        year: React.PropTypes.string,
        publicMdtext: React.PropTypes.string,
        poster: React.PropTypes.object,
    }

    render() {
        const {
            desktopGutterLess,
            desktopGutterMini,
        } = theme.spacing;
        const widePoster = moment(this.props.end).isAfter(moment([2016, 7, 1]));
        if (widePoster) {
            return (
                <Paper style={{ marginBottom: desktopGutterLess }}>
                    {this.props.poster
                            ? <Link
                                to={`/${this.props.year}/${this.props.tag}`}
                            >
                                <img
                                    alt=""
                                    src={this.props.poster.normalPath}
                                    className="responsive"
                                />
                            </Link>
                            : null
                    }
                    <div
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                            paddingTop: this.props.poster ? null : desktopGutterLess,
                            paddingBottom: desktopGutterLess,
                        }}
                    >
                        <h2 style={{ marginTop: desktopGutterMini }}>
                            <Link to={`/${this.props.year}/${this.props.tag}`}>
                                {this.props.title}
                            </Link>
                        </h2>
                        <div className="meta">
                            <Daterange start={this.props.start} end={this.props.end} />
                        </div>
                        <Text text={this.props.publicMdtext} />
                    </div>
                </Paper>
            );
        }
        return (
            <Paper style={{ display: 'flex', marginBottom: desktopGutterLess }}>
                <div style={{ width: this.props.poster ? '50%' : '100%', padding: desktopGutterLess }}>
                    <h2 style={{ marginTop: desktopGutterMini }}>
                        <Link to={`/${this.props.year}/${this.props.tag}`}>
                            {this.props.title}
                        </Link>
                    </h2>
                    <div className="meta">
                        <Daterange start={this.props.start} end={this.props.end} />
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
                            paddingLeft: desktopGutterLess,
                        }}
                    />
                    : null
                }
            </Paper>
        );
    }
}
