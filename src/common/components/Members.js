import React from 'react';
import Relay from 'react-relay';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

import GroupItem from './GroupItem';

import theme from '../theme';

class Members extends React.Component {
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
        const org = this.props.organization;
        return (
            <section>
                <h1>Medlemmer</h1>
                {org.instrument_groups.map(group => <GroupItem key={group.id} {...group} />)}
            </section>
        );
    }
}

export default Relay.createContainer(Members, {
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            instrument_groups {
                id
                name
                members {
                    id
                    user {
                        name
                        email
                        phone
                        membership_status
                        instrument
                    }
                    role {
                        title
                        email
                    }
                }
            }
        }`,
    },
});
