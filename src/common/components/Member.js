import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { lightBlue100 } from 'material-ui/styles/colors';

import theme from '../theme';
import Text from './Text';
import Phone from './Phone';
import Date from './Date';
import DateFromNow from './DateFromNow';
import Yesno from './Yesno';

class Member extends React.Component {
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

    state = {
        edit: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    toggleEdit = () => {
        this.setState({
            edit: !this.state.edit,
        });
    }

    closeEdit = () => {
        this.setState({
            edit: false,
        });
    }

    saveMember = (event, closeEdit) => {
        /*
        this.context.relay.commitUpdate(new EditEventMutation({
            viewer: null,
            eventid: event.id,
            title: event.title,
            location: event.location,
            start: event.start,
            end: event.end,
            mdtext: event.mdtext,
        }), {
            onSuccess: () => {
                closeEdit();
            },
            onFailure: (error, ost, kake) => {
                console.error('AD', error, ost, kake);
            },
        });
        */
    }

    render() {
        const member = this.props.organization.member;
        const user = member.user;
        const isMember = this.props.organization.is_member;
        if (!isMember) {
            return <div />;
        }
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>{user.name}</h1>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                    </IconMenu>
                </div>
                <div
                    style={{ display: 'flex', justifyContent: 'space-between', margin: '0 -20px' }}
                >
                    <div style={{ padding: '0 20px' }}>
                        <div>
                            <a href={`mailto:${user.email}`}>{user.email}</a>
                        </div>
                        <div>
                            <Phone phone={user.phone} />
                        </div>
                        <div>
                            {user.address}
                            <br />
                            {user.postcode} {user.city}
                        </div>
                        <div>
                            <h3>Grupper</h3>
                            <ul>
                                {user.groups.map(group => <li key={group.id}>{group.name}</li>)}
                            </ul>
                        </div>
                        <div style={{ backgroundColor: lightBlue100 }}>
                            <div>
                                Reskontro: {user.reskontro}
                            </div>
                            <Text text={user.membership_history} />
                            <div>
                                Brukernavn {user.username},
                                aktiv: <Yesno value={user.is_active} />,
                                i medlemslista: <Yesno value={user.in_list} />,
                                unngår epost: <Yesno value={user.no_email} />,
                                permisjon: <Yesno value={user.on_leave} />
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '0 20px', width: '25%', minWidth: 230 }}>
                        <Paper>
                            <img src={user.profile_picture_path} alt={`Bilde av ${user.name}`} />
                        </Paper>
                        <div>Bursdag <Date date={user.born} format="Do MMMM" /></div>
                        <div>
                            Startet for <DateFromNow date={user.joined} /> og har NMF-nummer {user.nmf_id}
                        </div>
                    </div>
                </div>
            </Paper>
        );
    }
}

export default Relay.createContainer(Member, {
    initialVariables: {
        username: null,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            is_member
            member(username:$username) {
                id
                role {
                    title
                    email
                }
                user {
                    id
                    username
                    name
                    email
                    groups {
                        id
                        name
                    }
                    is_active
                    is_admin
                    created
                    facebook_id
                    google_id
                    twitter_id
                    nmf_id
                    phone
                    address
                    postcode
                    city
                    country
                    born
                    joined
                    instrument
                    instrument_insurance
                    reskontro
                    membership_history
                    profile_picture
                    profile_picture_path
                    membership_status
                    in_list
                    on_leave
                    no_email
                }
            }
        }
        `,
    },
});
