import areIntlLocalesSupported from 'intl-locales-supported';
import Checkbox from 'material-ui/Checkbox';
import DatePicker from 'material-ui/DatePicker';
import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import { lightBlue100 } from 'material-ui/styles/colors';
import moment from 'moment';

import theme from '../theme';
import Text from './Text';
import Phone from './Phone';
import Date from './Date';
import DateFromNow from './DateFromNow';
import Yesno from './Yesno';
import EditUserMutation from '../mutations/editUser';

let DateTimeFormat;
if (areIntlLocalesSupported(['nb'])) {
    DateTimeFormat = global.Intl.DateTimeFormat;
}

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
        editMember: false,
        name: this.props.organization.member.user.name || '',
        username: this.props.organization.member.user.username || '',
        phone: this.props.organization.member.user.phone || '',
        email: this.props.organization.member.user.email || '',
        instrument: this.props.organization.member.user.instrument || '',
        born: this.props.organization.member.user.born ? moment(this.props.organization.member.user.born).toDate() : null,
        address: this.props.organization.member.user.address || '',
        postcode: this.props.organization.member.user.postcode || '',
        city: this.props.organization.member.user.city || '',
        country: this.props.organization.member.user.country || '',
        joined: this.props.organization.member.user.joined ? moment(this.props.organization.member.user.joined).toDate() : null,
        nmfId: this.props.organization.member.user.nmfId || '',
        reskontro: this.props.organization.member.user.reskontro || '',
        membershipHistory: this.props.organization.member.user.membershipHistory || '',
        inList: this.props.organization.member.user.inList,
        onLeave: this.props.organization.member.user.onLeave,
        noEmail: this.props.organization.member.user.noEmail,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    openEditMember = () => {
        this.setState({
            editMember: true,
        });
    }

    closeEditMember = () => {
        this.setState({
            editMember: false,
        });
    }

    saveMember = (event) => {
        event.preventDefault();
        this.context.relay.commitUpdate(new EditUserMutation({
            organization: this.props.organization,
            userId: this.props.organization.member.user.id,
            username: this.state.username,
            name: this.state.name,
            phone: this.state.phone,
            email: this.state.email,
            instrument: this.state.instrument,
            born: this.state.born,
            address: this.state.address,
            postcode: this.state.postcode,
            city: this.state.city,
            country: this.state.country,
            joined: this.state.joined,
            nmfId: this.state.nmfId,
            reskontro: this.state.reskontro,
            membershipHistory: this.state.membershipHistory,
            inList: this.state.inList,
            onLeave: this.state.onLeave,
            noEmail: this.state.noEmail,
        }), {
            onSuccess: () => {
                this.setState({
                    edit: false,
                    editMember: false,
                });
            },
            onFailure: (error, ost, kake) => {
                console.error('AD', error, ost, kake);
            },
        });
    }

    onChangeName = (event, name) => {
        this.setState({ name });
    }
    onChangePhone = (event, phone) => {
        this.setState({ phone });
    }
    onChangeEmail = (event, email) => {
        this.setState({ email });
    }
    onChangeInstrument = (event, instrument) => {
        this.setState({ instrument });
    }
    onChangeAddress = (event, address) => {
        this.setState({ address });
    }
    onChangePostcode = (event, postcode) => {
        this.setState({ postcode });
    }
    onChangeCity = (event, city) => {
        this.setState({ city });
    }
    onChangeCountry = (event, country) => {
        this.setState({ country });
    }
    onChangeNmfId = (event, nmfID) => {
        this.setState({ nmfID });
    }
    onChangeReskontro = (event, reskontro) => {
        this.setState({ reskontro });
    }
    onChangeMembershipHistory = (event, membershipHistory) => {
        this.setState({ membershipHistory });
    }
    onChangeJoined = (event, joined) => {
        this.setState({ joined });
    }
    onChangeBorn = (event, born) => {
        this.setState({ born });
    }
    onChangeInList = (event, inList) => {
        this.setState({ inList });
    }
    onChangeOnLeave = (event, onLeave) => {
        this.setState({ onLeave });
    }
    onChangeNoEmail = (event, noEmail) => {
        this.setState({ noEmail });
    }

    render() {
        const member = this.props.organization.member;
        const user = member.user;
        const isMember = this.props.organization.isMember;
        if (!isMember) {
            return <div />;
        }
        if (this.state.editMember) {
            return (
                <Paper className="row">
                    <form onSubmit={this.saveMember}>
                        <div>
                            <TextField
                                id="name"
                                floatingLabelText="Navn"
                                onChange={this.onChangeName}
                                value={this.state.name}
                            />
                        </div>
                        <div>
                            <TextField
                                id="phone"
                                floatingLabelText="Telefon"
                                onChange={this.onChangePhone}
                                value={this.state.phone}
                            />
                        </div>
                        <div>
                            <TextField
                                id="email"
                                floatingLabelText="E-post"
                                onChange={this.onChangeEmail}
                                value={this.state.email}
                            />
                        </div>
                        <div>
                            <TextField
                                id="instrument"
                                floatingLabelText="Instrument"
                                onChange={this.onChangeInstrument}
                                value={this.state.instrument}
                            />
                        </div>
                        <div>
                            <DatePicker
                                id="born"
                                floatingLabelText="Fødselsdato"
                                onChange={this.onChangeBorn}
                                value={this.state.born}
                                mode="landscape"
                                locale="nb"
                                DateTimeFormat={DateTimeFormat}
                            />
                        </div>
                        <div>
                            <TextField
                                id="address"
                                floatingLabelText="Adresse"
                                onChange={this.onChangeAddress}
                                value={this.state.address}
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
                                floatingLabelText="Sted"
                                onChange={this.onChangeCity}
                                value={this.state.city}
                            />
                        </div>
                        <div>
                            <TextField
                                id="country"
                                floatingLabelText="Land"
                                onChange={this.onChangeCountry}
                                value={this.state.country}
                            />
                        </div>
                        <div>
                            <TextField
                                id="nmfId"
                                floatingLabelText="NMF-nummer"
                                onChange={this.onChangeNmfId}
                                value={this.state.nmfId}
                            />
                        </div>
                        <div>
                            <TextField
                                id="reskontro"
                                floatingLabelText="Reskontro"
                                onChange={this.onChangeReskontro}
                                value={this.state.reskontro}
                            />
                        </div>
                        <div>
                            <DatePicker
                                id="joined"
                                floatingLabelText="Startet i korpset"
                                onChange={this.onChangeJoined}
                                value={this.state.joined}
                                mode="landscape"
                                locale="nb"
                                DateTimeFormat={DateTimeFormat}
                            />
                        </div>
                        <div>
                            <TextField
                                id="membershipHistory"
                                floatingLabelText="Medlemskapshistorikk"
                                onChange={this.onChangeMembershipHistory}
                                value={this.state.membershipHistory}
                                multiLine
                                fullWidth
                            />
                        </div>
                        <div>
                            <Checkbox
                                id="inList"
                                label="Synlig i medlemslista"
                                onCheck={this.onChangeInList}
                                checked={this.state.inList}
                            />
                        </div>
                        <div>
                            <Checkbox
                                id="onLeave"
                                label="Har permisjon"
                                onCheck={this.onChangeOnLeave}
                                checked={this.state.onLeave}
                            />
                        </div>
                        <div>
                            <Checkbox
                                id="noEmail"
                                label="Ikke epost"
                                onCheck={this.onChangeNoEmail}
                                checked={this.state.noEmail}
                            />
                        </div>
                        <div>
                            <RaisedButton type="submit" label="Lagre" primary />
                        </div>
                    </form>
                </Paper>
            );
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
                        <MenuItem primaryText="Rediger" onTouchTap={this.openEditMember} />
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
                            <Text text={user.membershipHistory} />
                            <div>
                                Brukernavn {user.username},
                                aktiv: <Yesno value={user.isActive} />,
                                i medlemslista: <Yesno value={user.inList} />,
                                unngår epost: <Yesno value={user.noEmail} />,
                                permisjon: <Yesno value={user.onLeave} />
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '0 20px', width: '25%', minWidth: 230 }}>
                        <Paper>
                            <img src={user.profilePicturePath} alt={`Bilde av ${user.name}`} />
                        </Paper>
                        <div>Bursdag <Date date={user.born} format="Do MMMM" /></div>
                        <div>
                            Startet for <DateFromNow date={user.joined} /> og har NMF-nummer {user.nmfId}
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
            isMember
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
                    isActive
                    isAdmin
                    created
                    facebookId
                    googleId
                    twitterId
                    nmfId
                    phone
                    address
                    postcode
                    city
                    country
                    born
                    joined
                    instrument
                    instrumentInsurance
                    reskontro
                    membershipHistory
                    profilePicture
                    profilePicturePath
                    membershipStatus
                    inList
                    onLeave
                    noEmail
                }
            }
            ${EditUserMutation.getFragment('organization')}
        }
        `,
    },
});
