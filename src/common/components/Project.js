import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';

import Date from './Date';
import Text from './Text';
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

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        const project = this.props.organization.project;
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
            project(year:$year, tag:$tag) {
                title
                tag
                start
                end
                year
                public_mdtext
                conductors {
                    name
                }
                poster {
                    filename
                }
            }
        }`,
    },
});

