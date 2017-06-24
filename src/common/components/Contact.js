import { Card, CardHeader, CardMedia, CardTitle } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import Relay from 'react-relay';
import PropTypes from 'prop-types';

import ContactRoles from './ContactRoles';

class Contact extends React.Component {
    static propTypes = {
        organization: PropTypes.object,
    }

    state = {
        contacts: this.props.organization.contacts,
        editContacts: false,
    }

    renderNormal() {
        const { organization } = this.props;
        return (
            <div>
                {organization.isAdmin
                        ? <div style={{ float: 'right' }}>
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem
                                    primaryText="Rediger kontaktpersoner"
                                    onTouchTap={() => {
                                        this.setState({ editContacts: !this.state.editContacts });
                                    }}
                                />
                            </IconMenu>
                        </div>
                        : null
                }
                <h1>Kontakt oss</h1>
                <p>{organization.contactText}</p>
                <h2>Kontaktpersoner</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {this.state.contacts.map((contact) => {
                        const role = contact.roles[0]; // Will always be 1
                        const user = contact.user;
                        return (
                            <Card style={{ minWidth: 300 }} key={contact.id}>
                                <CardHeader title={role.name} />
                                <CardMedia>
                                    {user.profilePicture && user.profilePicture.normalPath
                                        ? <img src={user.profilePicture.normalPath} alt="" />
                                        : null
                                    }
                                </CardMedia>
                                <CardTitle title={contact.user.name} />
                            </Card>
                        );
                    })}
                </div>
                <h2>Kart</h2>
                <Paper>
                    <iframe
                        width="100%"
                        height="400px"
                        frameBorder="0"
                        src={organization.mapUrl}
                    />
                </Paper>
            </div>
        );
    }

    render() {
        const { organization } = this.props;
        return (
            <Paper className="row">
                { organization.isAdmin && this.state.editContacts
                    ? <ContactRoles
                        organization={organization}
                        saveHook={() => {
                            this.setState({ editContacts: false });
                        }}
                    />
                    : this.renderNormal()
                }
            </Paper>
        );
    }
}

export default Relay.createContainer(Contact, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isAdmin
                contacts {
                    id
                    user {
                        id
                        name
                        profilePicture {
                            normalPath
                        }
                    }
                    roles {
                        id
                        name
                    }
                }
                contactText
                mapUrl
                ${ContactRoles.getFragment('organization')}
            }`;
        },
    },
});
