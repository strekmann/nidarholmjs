import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "material-ui/Paper";
import Button from "@material-ui/core/Button";
import MoreVertIcon from "material-ui/svg-icons/navigation/more-vert";
import TextField from "material-ui/TextField";
import * as React from "react";
import { createFragmentContainer, graphql, RelayProp } from "react-relay";
import EditContactInfoMutation from "../mutations/EditContactInfo";
import ContactRoles from "./ContactRoles";
import ContactUser from "./ContactUser";
import { Contact_organization } from "./__generated__/Contact_organization.graphql";

type Props = {
  organization: Contact_organization,
  relay: RelayProp,
};

type State = {
  menuIsOpen: null | HTMLElement,
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
};

class Contact extends React.Component<Props, State> {
  state = {
    menuIsOpen: null,
    editContacts: false,
    editInfo: false,
    visitorLocation: this.props.organization.visitorLocation || "",
    visitorAddress: this.props.organization.visitorAddress || "",
    city: this.props.organization.city || "",
    mailAddress: this.props.organization.mailAddress || "",
    postcode: this.props.organization.postcode || "",
    organizationNumber: this.props.organization.organizationNumber || "",
    publicBankAccount: this.props.organization.publicBankAccount || "",
    contactText: this.props.organization.contactText || "",
    mapText: this.props.organization.mapText || "",
    mapUrl: this.props.organization.mapUrl || "",
  };

  onMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    this.setState({ menuIsOpen: event.currentTarget });
  };
  onMenuClose = () => {
    this.setState({ menuIsOpen: null });
  };

  onChangeVisitorLocation = (event, visitorLocation) => {
    this.setState({ visitorLocation });
  };

  onChangeVisitorAddress = (event, visitorAddress) => {
    this.setState({ visitorAddress });
  };

  onChangeMailAddress = (event, mailAddress) => {
    this.setState({ mailAddress });
  };

  onChangePostcode = (event, postcode) => {
    this.setState({ postcode });
  };

  onChangeCity = (event, city) => {
    this.setState({ city });
  };

  onChangeOrganizationNumber = (event, organizationNumber) => {
    this.setState({ organizationNumber });
  };

  onChangePublicBankAccount = (event, publicBankAccount) => {
    this.setState({ publicBankAccount });
  };

  onChangeContactText = (event, contactText) => {
    this.setState({ contactText });
  };

  onChangeMapText = (event, mapText) => {
    this.setState({ mapText });
  };

  onChangeMapUrl = (event, mapUrl) => {
    this.setState({ mapUrl });
  };

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
  };

  renderNormal() {
    const { organization } = this.props;
    return (
      <Paper className="row">
        {organization.isAdmin ? (
          <div style={{ float: "right" }}>
            <IconButton onClick={this.onMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={this.state.menuIsOpen}
              onClose={this.onMenuClose}
              open={Boolean(this.state.menuIsOpen)}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem
                onClick={() => {
                  this.setState({ editContacts: !this.state.editContacts });
                }}
              >
                Rediger kontaktpersoner
              </MenuItem>
              <MenuItem
                onClick={() => {
                  this.setState({ editInfo: !this.state.editInfo });
                }}
              >
                Rediger kontaktinfo
              </MenuItem>
            </Menu>
          </div>
        ) : null}
        <h1>Kontakt oss</h1>
        <p>{organization.contactText}</p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {organization.visitorAddress ? (
            <dl style={{ minWidth: 220 }}>
              <dt>Besøksadresse</dt>
              <dd>{organization.visitorLocation}</dd>
              <dd>{organization.visitorAddress}</dd>
              <dd>{organization.city}</dd>
            </dl>
          ) : null}
          {organization.mailAddress ? (
            <dl style={{ minWidth: 220 }}>
              <dt>Postadresse</dt>
              <dd>{organization.mailAddress}</dd>
              <dd>
                {organization.postcode} {organization.city}
              </dd>
            </dl>
          ) : null}
          {organization.organizationNumber ? (
            <dl style={{ minWidth: 220 }}>
              <dt>Organisasjonsnummer</dt>
              <dd>{organization.organizationNumber}</dd>
            </dl>
          ) : null}
          {organization.publicBankAccount ? (
            <dl style={{ minWidth: 220 }}>
              <dt>Bankkonto</dt>
              <dd>{organization.publicBankAccount}</dd>
            </dl>
          ) : null}
        </div>
        {organization.contacts ? (
          <div>
            <h2>Kontaktpersoner</h2>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {organization.contacts &&
                organization.contacts.map((contact) => {
                  return (
                    <ContactUser
                      key={contact.id}
                      user={contact.user}
                      role={contact.roles[0]}
                    />
                  );
                })}
            </div>
          </div>
        ) : null}
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
            <Button type="submit" color="primary">
              Lagre
            </Button>
            <Button
              type="reset"
              onClick={() => {
                this.setState({ editInfo: false });
              }}
            >
              Avbryt
            </Button>
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

export default createFragmentContainer(Contact, {
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
    }
  `,
});
