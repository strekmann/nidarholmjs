/* @flow */

import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import EditContactInfoMutation from '../mutations/EditContactInfo';

import ContactUser from './ContactUser';
import ContactRoles from './ContactRoles';

type Props = {
    organization: {
        contacts: Array<{
            id: string,
            user: {},
            roles: Array<{}>,
        }>,
        isAdmin: boolean,
        visitorLocation: string,
        visitorAddress: string,
        city: string,
        mailAddress: string,
        postcode: string,
        organizationNumber: string,
        publicBankAccount: string,
        contactText: string,
        mapText: string,
        mapUrl: string,
    },
    relay: {
        environment: {},
    },
}

type State = {
    editContacts: boolean,
    editInfo: boolean,
    visitorLocation: string,
    visitorAddress: string,
    city: string,
    mailAddress: string,
    postcode: string,
    organizationNumber: string,
    publicBankAccount: string,
    contactText: string,
    mapText: string,
    mapUrl: string,
}

class Contact extends React.Component<Props, State> {
    state = {
        editContacts: false,
        editInfo: false,
        visitorLocation: this.props.organization.visitorLocation || '',
        visitorAddress: this.props.organization.visitorAddress || '',
        city: this.props.organization.city || '',
        mailAddress: this.props.organization.mailAddress || '',
        postcode: this.props.organization.postcode || '',
        organizationNumber: this.props.organization.organizationNumber || '',
        publicBankAccount: this.props.organization.publicBankAccount || '',
        contactText: this.props.organization.contactText || '',
        mapText: this.props.organization.mapText || '',
        mapUrl: this.props.organization.mapUrl || '',
    }

    onChangeVisitorLocation = (event, visitorLocation) => {
        this.setState({ visitorLocation });
    }

    onChangeVisitorAddress = (event, visitorAddress) => {
        this.setState({ visitorAddress });
    }

    onChangeMailAddress = (event, mailAddress) => {
        this.setState({ mailAddress });
    }

    onChangePostcode = (event, postcode) => {
        this.setState({ postcode });
    }

    onChangeCity = (event, city) => {
        this.setState({ city });
    }

    onChangeOrganizationNumber = (event, organizationNumber) => {
        this.setState({ organizationNumber });
    }

    onChangePublicBankAccount = (event, publicBankAccount) => {
        this.setState({ publicBankAccount });
    }

    onChangeContactText = (event, contactText) => {
        this.setState({ contactText });
    }

    onChangeMapText = (event, mapText) => {
        this.setState({ mapText });
    }

    onChangeMapUrl = (event, mapUrl) => {
        this.setState({ mapUrl });
    }

    saveContactInfo = (event) => {
        event.preventDefault();
        const { relay } = this.props;
        const {
            visitorLocation,
            visitorAddress,
            city,
            mailAddress,
            postcode,
            organizationNumber,
            publicBankAccount,
            contactText,
            mapText,
        } = this.state;
        EditContactInfoMutation.commit(
            relay.environment,
            {
                visitorLocation,
                visitorAddress,
                city,
                postcode,
                organizationNumber,
                mailAddress,
                publicBankAccount,
                contactText,
                mapText,
            },
            () => {
                this.setState({
                    editInfo: false,
                });
            },
        );
    }

    renderNormal() {
        const { organization } = this.props;
        return (
            <Paper className="row">
                {organization.isAdmin
                    ? (
                        <div style={{ float: 'right' }}>
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
                                <MenuItem
                                    primaryText="Rediger kontaktinfo"
                                    onTouchTap={() => {
                                        this.setState({ editInfo: !this.state.editInfo });
                                    }}
                                />
                            </IconMenu>
                        </div>
                    )
                    : null
                }
                <h1>Kontakt oss</h1>
                <p>{organization.contactText}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {organization.visitorAddress
                        ? (
                            <dl style={{ minWidth: 220 }}>
                                <dt>Besøksadresse</dt>
                                <dd>{organization.visitorLocation}</dd>
                                <dd>{organization.visitorAddress}</dd>
                                <dd>{organization.city}</dd>
                            </dl>
                        )
                        : null
                    }
                    {organization.mailAddress
                        ? (
                            <dl style={{ minWidth: 220 }}>
                                <dt>Postadresse</dt>
                                <dd>{organization.mailAddress}</dd>
                                <dd>{organization.postcode} {organization.city}</dd>
                            </dl>
                        )
                        : null
                    }
                    {organization.organizationNumber
                        ? (
                            <dl style={{ minWidth: 220 }}>
                                <dt>Organisasjonsnummer</dt>
                                <dd>{organization.organizationNumber}</dd>
                            </dl>
                        )
                        : null
                    }
                    {organization.publicBankAccount
                        ? (
                            <dl style={{ minWidth: 220 }}>
                                <dt>Bankkonto</dt>
                                <dd>{organization.publicBankAccount}</dd>
                            </dl>
                        )
                        : null
                    }
                </div>
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
                <p>{organization.mapText}</p>
                <Paper>
                    <iframe
                        title="map"
                        width="100%"
                        height="400"
                        frameBorder="0"
                        src={this.state.mapUrl}
                    />
                </Paper>
            </Paper>
        );
    }

    renderEditInfo() {
        return (
            <Paper className="row">
                <h1>Rediger kontaktinfo</h1>
                <form onSubmit={this.saveContactInfo}>
                    <div>
                        <TextField
                            id="visitorLocation"
                            floatingLabelText="Besøkssted"
                            onChange={this.onChangeVisitorLocation}
                            value={this.state.visitorLocation}
                        />
                    </div>
                    <div>
                        <TextField
                            id="visitorAddress"
                            floatingLabelText="Besøksadresse"
                            onChange={this.onChangeVisitorAddress}
                            value={this.state.visitorAddress}
                        />
                    </div>
                    <div>
                        <TextField
                            id="mailAddress"
                            floatingLabelText="Postadresse"
                            onChange={this.onChangeMailAddress}
                            value={this.state.mailAddress}
                        />
                    </div>
                    <div>
                        <TextField
                            id="postcode"
                            floatingLabelText="Postnummer"
                            onChange={this.onChangePostcode}
                            value={this.state.postcode}
                        />
                    </div>
                    <div>
                        <TextField
                            id="city"
                            floatingLabelText="Poststed"
                            onChange={this.onChangeCity}
                            value={this.state.city}
                        />
                    </div>
                    <div>
                        <TextField
                            id="organizationNumber"
                            floatingLabelText="Organisasjonsnummer"
                            onChange={this.onChangeOrganizationNumber}
                            value={this.state.organizationNumber}
                        />
                    </div>
                    <div>
                        <TextField
                            id="publicBankAccount"
                            floatingLabelText="Kontonummer"
                            onChange={this.onChangePublicBankAccount}
                            value={this.state.publicBankAccount}
                        />
                    </div>
                    <div>
                        <TextField
                            id="contactText"
                            floatingLabelText="Introtekst på kontaktside"
                            onChange={this.onChangeContactText}
                            value={this.state.contactText}
                            fullWidth
                            multiLine
                        />
                    </div>
                    <div>
                        <TextField
                            id="mapText"
                            floatingLabelText="Karttekst"
                            onChange={this.onChangeMapText}
                            value={this.state.mapText}
                            fullWidth
                            multiLine
                        />
                    </div>
                    <div>
                        <TextField
                            id="mapUrl"
                            floatingLabelText="URL til kart"
                            onChange={this.onChangeMapUrl}
                            value={this.state.mapUrl}
                            fullWidth
                        />
                    </div>
                    <div>
                        <RaisedButton type="submit" label="Lagre" primary />
                        <RaisedButton
                            type="cancel"
                            label="Avbryt"
                            onTouchTap={() => {
                                this.setState({ editInfo: false });
                            }}
                        />
                    </div>
                </form>
            </Paper>
        );
    }

    renderContactRoles() {
        const { organization } = this.props;
        return (
            <Paper className="row">
                <ContactRoles
                    organization={organization}
                    saveHook={() => {
                        this.setState({ editContacts: false });
                    }}
                />
            </Paper>
        );
    }

    render() {
        const { organization } = this.props;
        if (organization.isAdmin) {
            if (this.state.editContacts) {
                return this.renderContactRoles();
            }
            if (this.state.editInfo) {
                return this.renderEditInfo();
            }
        }
        return this.renderNormal();
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
            mapText
            mailAddress
            postcode
            city
            visitorLocation
            visitorAddress
            organizationNumber
            publicBankAccount
            ...ContactRoles_organization
        }`,
    },
);
