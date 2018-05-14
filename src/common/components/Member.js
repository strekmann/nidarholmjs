/* @flow */
/* eslint "max-len": 0 */

import areIntlLocalesSupported from 'intl-locales-supported';
import AutoComplete from 'material-ui/AutoComplete';
import Checkbox from 'material-ui/Checkbox';
import DatePicker from 'material-ui/DatePicker';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { lightBlue100 } from 'material-ui/styles/colors';
import Close from 'material-ui/svg-icons/navigation/close';
import moment from 'moment';
import PropTypes from 'prop-types';
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import Link from 'found/lib/Link';

import theme from '../theme';
import EditUserMutation from '../mutations/EditUser';
import JoinGroupMutation from '../mutations/JoinGroup';
import LeaveGroupMutation from '../mutations/LeaveGroup';
import AddRoleMutation from '../mutations/AddRole';
import RemoveRoleMutation from '../mutations/RemoveRole';

import Text from './Text';
import Phone from './Phone';
import Date from './Date';
import DateFromNow from './DateFromNow';
import ProfilePicture from './ProfilePicture';
import Yesno from './Yesno';

let DateTimeFormat;
if (areIntlLocalesSupported(['nb'])) {
    ({ DateTimeFormat } = global.Intl);
}

type Props = {
    organization: {
        isAdmin: boolean,
        member: {
            id: string,
            user: {
                id: string,
                name: string,
                username: string,
                phone: string,
                email: string,
                instrument: string,
                born: string,
                address: string,
                postcode: string,
                city: string,
                country: string,
                joined: Date,
                nmfId: string,
                reskontro: string,
                membershipHistory: string,
                inList: boolean,
                onLeave: boolean,
                noEmail: boolean,
                isActive: boolean,
                groups: [{
                    id: string,
                    name: string,
                }],
            },
            roles: [{
                id: string,
                email: string,
                name: string,
            }],
        },
        groups: [{
            name: string,
        }],
        roles: {
            edges: [{
                node: {
                    id: string,
                    name: string,
                },
            }],
        },
    },
    relay: {
        environment: {},
    },
    viewer: {
        id: string,
    },
}

type State = {
    name: string,
    username: string,
    phone: string,
    email: string,
    instrument: string,
    born: ?string,
    address: string,
    postcode: string,
    city: string,
    country: string,
    joined: ?string,
    nmfId: string,
    reskontro: string,
    membershipHistory: string,
    inList: boolean,
    onLeave: boolean,
    noEmail: boolean,
    addingRole: boolean,
    editMember: boolean,
    joinGroup: boolean,
}

class Member extends React.Component<Props, State> {
    muiTheme: {};

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        editMember: false,
        joinGroup: false,
        addingRole: false,
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
    /*
    onChangeNmfId = (event, nmfID) => {
        this.setState({ nmfID });
    }
    */
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
    saveMember = (event) => {
        event.preventDefault();
        const { relay } = this.props;
        const data = {
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
            joined: undefined,
            nmfId: undefined,
            reskontro: undefined,
            membershipHistory: undefined,
            inList: undefined,
            onLeave: undefined,
            noEmail: undefined,
        };
        if (this.props.organization.isAdmin) {
            data.joined = this.state.joined;
            data.nmfId = this.state.nmfId;
            data.reskontro = this.state.reskontro;
            data.membershipHistory = this.state.membershipHistory;
            data.inList = this.state.inList;
            data.onLeave = this.state.onLeave;
            data.noEmail = this.state.noEmail;
        }
        EditUserMutation.commit(
            relay.environment,
            data,
            () => {
                this.setState({
                    editMember: false,
                });
            },
        );
    }
    closeEditMember = () => {
        this.setState({
            editMember: false,
        });
    }
    openEditMember = () => {
        this.setState({
            editMember: true,
        });
    }
    addRole = (roleId) => {
        this.setState({ addingRole: false });
        AddRoleMutation.commit(
            this.props.relay.environment,
            {
                roleId,
                memberId: this.props.organization.member.id,
            },
        );
    }
    removeRole= (roleId) => {
        RemoveRoleMutation.commit(
            this.props.relay.environment,
            {
                roleId,
                memberId: this.props.organization.member.id,
            },
        );
    }
    joinGroup = (selection) => {
        this.setState({ joinGroup: false });
        JoinGroupMutation.commit(
            this.props.relay.environment,
            {
                groupId: selection.value.id,
                userId: this.props.organization.member.user.id,
            },
        );
    }
    leaveGroup = (user, group) => {
        LeaveGroupMutation.commit(
            this.props.relay.environment,
            {
                groupId: group.id,
                userId: user.id,
            },
        );
    }
    closeJoinGroup = () => {
        this.setState({ joinGroup: false });
    }

    closeAddingRole = () => {
        this.setState({ addingRole: false });
    }

    render() {
        const { organization, viewer } = this.props;
        const {
            groups, isAdmin, member, roles,
        } = organization;
        const { user } = member;
        const { desktopGutterLess } = theme.spacing;
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
                        {isAdmin
                            ? (
                                <div>
                                    <div>
                                        <TextField
                                            id="nmfId"
                                            floatingLabelText="NMF-nummer"
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
                                </div>
                            )
                            : null
                        }
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
                    {isAdmin
                        ? (
                            <Dialog
                                title="Legg til i gruppe"
                                open={this.state.joinGroup}
                                onRequestClose={this.closeJoinGroup}
                                autoScrollBodyContent
                                actions={<FlatButton label="Avbryt" onTouchTap={this.closeJoinGroup} />}
                            >
                                <AutoComplete
                                    dataSource={groups.map((group) => {
                                        return { text: `${group.name}`, value: group };
                                    })}
                                    floatingLabelText="Gruppe"
                                    onNewRequest={this.joinGroup}
                                    filter={AutoComplete.fuzzyFilter}
                                    fullWidth
                                />
                            </Dialog>
                        )
                        : null
                    }
                    {isAdmin
                        ? (
                            <Dialog
                                title="Legg til verv"
                                open={this.state.addingRole}
                                onRequestClose={this.closeAddingRole}
                                autoScrollBodyContent
                                actions={<RaisedButton label="Avbryt" onTouchTap={this.closeAddingRole} />}
                            >
                                <List>
                                    {roles.edges.map((edge) => {
                                        return (
                                            <ListItem
                                                key={edge.node.id}
                                                primaryText={edge.node.name}
                                                onTouchTap={() => {
                                                    this.addRole(edge.node.id);
                                                }}
                                            />
                                        );
                                    })}
                                </List>
                            </Dialog>
                        )
                        : null
                    }
                    <Toolbar style={{ backgroundColor: theme.palette.fullWhite }}>
                        <ToolbarGroup lastChild>
                            {this.props.viewer.id === user.id
                                ? <FlatButton
                                    label="Logg ut"
                                    href="/logout"
                                />
                                : null
                            }
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem primaryText="Rediger" onTouchTap={this.openEditMember} />
                                {this.props.viewer.id === user.id
                                    ? <MenuItem
                                        primaryText="Bytt passord"
                                        containerElement={
                                            <Link to={`/users/${user.id}/reset`} />
                                        }
                                    />
                                    : null
                                }
                                {this.props.viewer.id === user.id
                                    ? <MenuItem
                                        primaryText="Logg på med Facebook"
                                        href="/login/facebook"
                                    />
                                    : null
                                }
                                {this.props.viewer.id === user.id
                                    ? <MenuItem
                                        primaryText="Logg på med Google"
                                        href="/login/google"
                                    />
                                    : null
                                }
                                {isAdmin
                                    ? <MenuItem
                                        primaryText="Legg til i gruppe"
                                        onTouchTap={() => {
                                            this.setState({ joinGroup: !this.state.joinGroup });
                                        }}
                                    />
                                    : null
                                }
                                {isAdmin
                                    ? <MenuItem
                                        primaryText="Legg til verv/rolle"
                                        onTouchTap={() => {
                                            this.setState({ addingRole: !this.state.addingRole });
                                        }}
                                    />
                                    : null
                                }
                            </IconMenu>
                        </ToolbarGroup>
                    </Toolbar>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginLeft: -desktopGutterLess,
                        marginRight: -desktopGutterLess,
                    }}
                >
                    <div
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                        }}
                    >
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
                        {member.roles.length
                            ? (
                                <div>
                                    <h3>Verv</h3>
                                    <List>
                                        {member.roles.map((role) => {
                                            return (
                                                <ListItem
                                                    key={role.id}
                                                    disabled
                                                    primaryText={role.name}
                                                    secondaryText={role.email
                                                        ? <a href={`mailto:${role.email}`}>{role.email}</a>
                                                        : null
                                                    }
                                                    rightIconButton={isAdmin
                                                        ? (
                                                            <IconButton
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    return this.removeRole(role.id);
                                                                }}
                                                            >
                                                                <Close />
                                                            </IconButton>
                                                        )
                                                        : null
                                                    }
                                                />
                                            );
                                        })}
                                    </List>
                                </div>
                            )
                            : null
                        }
                        <div>
                            {user.groups.length
                                ? (
                                    <div>
                                        <h3>Grupper</h3>
                                        <List>
                                            {user.groups.map((group) => {
                                                return (
                                                    <ListItem
                                                        key={group.id}
                                                        primaryText={group.name}
                                                        containerElement={
                                                            <Link to={`/group/${group.id}`} />
                                                        }
                                                        rightIconButton={isAdmin
                                                            ? (
                                                                <IconButton
                                                                    onClick={(event) => {
                                                                        event.preventDefault();
                                                                        return this.leaveGroup(user, group);
                                                                    }}
                                                                >
                                                                    <Close />
                                                                </IconButton>
                                                            )
                                                            : null
                                                        }
                                                    />
                                                );
                                            })}
                                        </List>
                                    </div>
                                )
                                : null
                            }
                        </div>
                        {isAdmin
                            ? (
                                <div style={{ backgroundColor: lightBlue100 }}>
                                    <h2>Admininfo</h2>
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
                            )
                            : null
                        }
                    </div>
                    <div
                        style={{
                            paddingLeft: desktopGutterLess,
                            paddingRight: desktopGutterLess,
                            width: '25%',
                            minWidth: 230,
                        }}
                    >
                        <ProfilePicture
                            user={user}
                            isViewer={user.id === viewer.id}
                            isAdmin={isAdmin}
                        />
                        {user.born
                            ? <div>Bursdag <Date date={user.born} format="Do MMMM" /></div>
                            : null
                        }
                        {user.joined
                            ? (
                                <div>
                                    Startet for <DateFromNow date={user.joined} />{ user.nmfId ? ` og har NMF-nummer ${user.nmfId}` : null }
                                </div>
                            )
                            : null
                        }
                    </div>
                </div>
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Member,
    {
        organization: graphql`
        fragment Member_organization on Organization {
            isMember
            isAdmin
            member(id:$id) {
                id
                roles {
                    id
                    name
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
                    membershipStatus
                    inList
                    onLeave
                    noEmail
                    ...ProfilePicture_user
                }
            }
            groups {
                id
                name
            }
            roles(first:100) {
                edges {
                    node {
                        id
                        name
                    }
                }
            }
        }`,
        viewer: graphql`
        fragment Member_viewer on User {
            id
        }
        `,
    },
);
