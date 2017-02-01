import Paper from 'material-ui/Paper';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';

import theme from '../theme';

class Groups extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        organization: React.PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        const { groups } = this.props.organization;
        return (
            <section>
                <Paper style={{ padding: 20 }}>
                    <h1>Alle grupper</h1>
                    {groups.map(group => (
                        <div key={group.id}>
                            <Link to={`/group/${group.id}`}>{group.name}</Link>
                            {group.externallyHidden
                                    ? ' h'
                                    : null
                            }
                        </div>
                    ))}
                </Paper>
            </section>
        );
    }
}

export default Relay.createContainer(Groups, {
    initialVariables: {
        groupId: null,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            groups {
                id
                name
                externallyHidden
            }
        }
        `,
    },
});
