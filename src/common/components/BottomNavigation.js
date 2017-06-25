import { BottomNavigation, BottomNavigationItem } from 'material-ui/BottomNavigation';
import Paper from 'material-ui/Paper';
import ActionDateRange from 'material-ui/svg-icons/action/date-range';
import NotificationEventNote from 'material-ui/svg-icons/notification/event-note';
import SocialGroupIcon from 'material-ui/svg-icons/social/group';
import { indigo50 } from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';

import theme from '../theme';

class Navigation extends React.Component {
    static propTypes = {
        organization: PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    getChildContext() {
        return { muiTheme: getMuiTheme(theme) };
    }

    render() {
        if (this.props.organization.isMember) {
            return (
                <Paper
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                    }}
                    className="hide-desktop"
                >
                    <BottomNavigation
                        style={{
                            backgroundColor: indigo50,
                        }}
                    >
                        <BottomNavigationItem
                            label="Prosjekter"
                            icon={<NotificationEventNote />}
                            containerElement={<Link to="/projects" />}
                            style={{ textAlign: 'center' }}
                        />
                        <BottomNavigationItem
                            label="Aktiviteter"
                            icon={<ActionDateRange />}
                            containerElement={<Link to="/events" />}
                            style={{ textAlign: 'center' }}
                        />
                        <BottomNavigationItem
                            label="Medlemmer"
                            icon={<SocialGroupIcon />}
                            containerElement={<Link to="/members" />}
                            style={{ textAlign: 'center' }}
                        />
                    </BottomNavigation>
                </Paper>
            );
        }
        return null;
    }
}

export default Relay.createContainer(Navigation, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                isMember,
            }`;
        },
    },
});
