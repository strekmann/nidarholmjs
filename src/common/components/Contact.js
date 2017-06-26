import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { List, ListItem } from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import EmailIcon from 'material-ui/svg-icons/communication/email';
import PhoneIcon from 'material-ui/svg-icons/communication/phone';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import React from 'react';
import Relay from 'react-relay';
import PropTypes from 'prop-types';

import ShowContactInfoMutation from '../mutations/showContactInfo';

import ContactRoles from './ContactRoles';
import Email from './Email';
import Phone from './Phone';

class Contact extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        organization: PropTypes.object,
    }

    state = {
        contacts: this.props.organization.contacts,
        editContacts: false,
    }

    showContactInfo = (user) => {
        this.context.relay.commitUpdate(new ShowContactInfoMutation({
            user,
        }), {
            onSuccess: (results) => {
                Object.assign(user, results.showContactInfo.user);
            },
        });
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
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {this.state.contacts.map((contact) => {
                        const role = contact.roles[0]; // Will always be 1
                        const user = contact.user;
                        return (
                            <Card style={{ width: 220, marginBottom: 15 }} key={contact.id}>
                                <CardHeader title={role.name} textStyle={{ paddingRight: 0 }} />
                                <CardMedia>
                                    {user.profilePicture && user.profilePicture.thumbnailPath
                                        ? <img src={user.profilePicture.thumbnailPath} alt="" />
                                        : null
                                    }
                                </CardMedia>
                                <CardTitle title={contact.user.name} />
                                {contact.user.phone || contact.user.email
                                    ? <CardText style={{ paddingTop: 0 }}>
                                        <div className="noMargins">
                                            <div>
                                                <Phone phone={contact.user.phone} />
                                            </div>
                                            <div>
                                                <Email email={contact.user.email} />
                                            </div>
                                        </div>
                                    </CardText>
                                    : null
                                }
                                {!contact.user.phone && !contact.user.email
                                    ? <CardActions>
                                        <FlatButton
                                            onClick={() => {
                                                this.showContactInfo(contact.user);
                                            }}
                                            label="Vis kontaktinfo"
                                        />
                                    </CardActions>
                                    : null
                                }
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
                            thumbnailPath
                        }
                        ${ShowContactInfoMutation.getFragment('user')}
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
