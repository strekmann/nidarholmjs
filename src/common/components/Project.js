import React from 'react';
import Relay from 'react-relay';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';

import Date from './Date';
import Text from './Text';
import EventList from './EventList';
import FileList from './FileList';
import MusicList from './MusicList';
import theme from '../theme';

class Project extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        public: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    togglePublic = () => {
        this.setState({ public: !this.state.public });
    }

    render() {
        const project = this.props.organization.project;
        const isMember = this.props.organization.is_member;
        if (!isMember) {
            return (
                <div>
                    <h1>{project.title}</h1>
                    <div className="meta">
                        {project.start ? <span><Date date={project.start} /> – </span> : null}
                        <Date date={project.end} />
                        {project.conductors.map(conductor => conductor.name)}
                    </div>
                    <Text text={project.public_mdtext} />
                    {project.poster ?
                        <img alt="Konsertplakat" src={project.poster.large_path} />
                        :
                        null
                    }
                </div>
            );
        }
        return (
            <div>
                <h1>{project.title}</h1>
                <div className="meta">
                    {project.start ? <span><Date date={project.start} /> – </span> : null}
                    <Date date={project.end} />
                    {project.conductors.map(conductor => conductor.name)}
                </div>
                <RaisedButton label="Public/private" onClick={this.togglePublic} />
                <Text text={this.state.public ? project.public_mdtext : project.private_mdtext} />
                {project.poster ?
                    <img alt="Konsertplakat" src={project.poster.large_path} />
                    :
                    null
                }
                <EventList events={project.events} />
                <FileList files={project.files} />
                <MusicList music={project.music} />
            </div>
        );
    }
}

export default Relay.createContainer(Project, {
    initialVariables: {
        year: '',
        tag: '',
    },
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            name
            is_member
            project(year:$year, tag:$tag) {
                title
                tag
                start
                end
                year
                public_mdtext
                private_mdtext
                conductors {
                    name
                }
                poster {
                    filename
                    large_path
                }
                events(first:100) {
                    edges {
                        node {
                            title
                            start
                            end
                            permissions {
                                public
                                groups
                                users
                            }
                        }
                    }
                }
                files(first:100) {
                    edges {
                        node {
                            filename
                            is_image
                            normal_path
                            permissions {
                                public
                                groups
                                users
                            }
                        }
                    }
                }
                music {
                    piece {
                        title
                        composers
                    }
                }
            }
        }`,
    },
});

