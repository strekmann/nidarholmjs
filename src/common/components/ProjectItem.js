import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import Paper from 'material-ui/Paper';
import moment from 'moment';

import theme from '../theme';

import Daterange from './Daterange';
import List from './List';
import Text from './Text';

class ProjectItem extends React.Component {
    static propTypes = {
        project: React.PropTypes.object.isRequired,
        showText: React.PropTypes.bool,
    }

    render() {
        const {
            desktopGutterLess,
            desktopGutterMini,
        } = theme.spacing;
        const {
            title,
            start,
            end,
            tag,
            year,
            publicMdtext,
            poster,
            conductors,
        } = this.props.project;
        const showText = this.props.showText;
        const widePoster = moment(end).isAfter(moment([2016, 7, 1]));
        if (widePoster) {
            return (
                <Paper style={{ marginBottom: desktopGutterLess }}>
                    {poster
                            ? <Link
                                to={`/${year}/${tag}`}
                            >
                                <img
                                    alt=""
                                    src={poster.normalPath}
                                    className="responsive"
                                />
                            </Link>
                            : null
                    }
                    <div
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                            paddingTop: poster ? null : desktopGutterLess,
                            paddingBottom: desktopGutterLess,
                        }}
                    >
                        <h2 style={{ marginTop: desktopGutterMini }}>
                            <Link to={`/${year}/${tag}`}>
                                {title}
                            </Link>
                        </h2>
                        <div className="meta">
                            <Daterange
                                start={start}
                                end={end}
                                noTime
                            />
                        </div>
                        {conductors.length
                            ? <p>Dirigent:
                                {' '}
                                <List
                                    items={conductors.map((conductor) => {
                                        return conductor.name;
                                    })}
                                />
                            </p>
                            : null
                        }
                        {showText
                            ? <Text text={publicMdtext} />
                            : null
                        }
                    </div>
                </Paper>
            );
        }
        return (
            <Paper style={{ display: 'flex', marginBottom: desktopGutterLess }}>
                <div style={{ width: poster ? '50%' : '100%', padding: desktopGutterLess }}>
                    <h2 style={{ marginTop: desktopGutterMini }}>
                        <Link to={`/${year}/${tag}`}>
                            {title}
                        </Link>
                    </h2>
                    <div className="meta">
                        <Daterange
                            start={start}
                            end={end}
                            noTime
                        />
                    </div>
                    {conductors.length
                        ? <p>Dirigent:
                            {' '}
                            <List
                                items={conductors.map((conductor) => {
                                    return conductor.name;
                                })}
                            />
                        </p>
                        : null
                    }
                    {showText
                        ? <Text text={publicMdtext} />
                        : null
                    }
                </div>
                {poster
                    ? <img
                        alt="Konsertplakat"
                        src={poster.normalPath}
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

export default Relay.createContainer(ProjectItem, {
    fragments: {
        project: () => {
            return Relay.QL`
            fragment on Project {
                id
                title
                start
                end
                year
                tag
                publicMdtext
                poster {
                    filename
                    normalPath
                }
                conductors {
                    name
                }
            }`;
        },
    },
});
