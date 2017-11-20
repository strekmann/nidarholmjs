import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import ContactUser from './ContactUser';
import ContactRoles from './ContactRoles';

class Contact extends React.Component {
    static propTypes = {
        organization: PropTypes.object,
    }

    state = {
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
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {this.props.organization.contacts.map((contact) => {
                        return (
                            <ContactUser
                                key={contact.id}
                                user={contact.user}
                                role={contact.roles[0]}
                            />
                        );
                    })}
                </div>
                <h2>Kart</h2>
                <Paper>
                    <iframe
                        title="map"
                        width="100%"
                        height="400"
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

export default createFragmentContainer(
    Contact,
    {
        organization: graphql`
        fragment Contact_organization on Organization {
            isAdmin
            contacts {
                id
                user {
                    ...ContactUser_user
                }
                roles {
                    id
                    name
                }
            }
            contactText
            mapUrl
            ...ContactRoles_organization
        }`,
    },
);
