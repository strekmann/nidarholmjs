import AutoComplete from 'material-ui/AutoComplete';
import Checkbox from 'material-ui/Checkbox';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';

import AddUserMutation from '../mutations/addUser';
import theme from '../theme';
import GroupItem from './GroupItem';


class Members extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
        router: React.PropTypes.object.isRequired,
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

    state = {
        addUser: false,
        name: '',
        email: '',
        instrument: '',
        exists: null,
        new: false,
        groupId: null,
        member: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onAutoCompleteChoose = (element, chosen) => {
        if (chosen > -1) {
            this.setState({
                new: false,
                exists: element,
                name: element.text,
            });
        }
        else {
            // Pressed enter without choosing
            this.setState({ new: true });
        }
    }

    onChangeEmail = (event, email) => {
        this.setState({ email });
    }

    onChangeGroup = (event, index, groupId) => {
        this.setState({ groupId });
    }

    onChangeInstrument = (event, instrument) => {
        this.setState({ instrument });
    }

    onChangeUserName = (name) => {
        this.setState({ name, exists: false });
    }

    onCheckMember = (event, member) => {
        this.setState({ member });
    }

    addUser = (event) => {
        event.preventDefault();
        this.context.relay.commitUpdate(new AddUserMutation({
            organization: this.props.organization,
            name: this.state.name,
            email: this.state.email,
            instrument: this.state.instrument,
            isMember: this.state.member,
            groupId: this.state.groupId,
        }), {
            onSuccess: (results) => {
                this.setState({ addUser: false });
                this.context.router.push({ pathname: `/users/${results.addUser.newUser.id}` });
            },
        });
    }

    toggleAddUser = () => {
        this.setState({
            addUser: !this.state.addUser,
        });
    }

    closeAddUser = () => {
        this.setState({
            addUser: false,
        });
    }

    render() {
        const org = this.props.organization;
        const isAdmin = org.isAdmin;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Medlemmer</h1>
                    </div>
                    {isAdmin
                        ? <IconMenu
                            iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Finn / legg til medlem"
                                onTouchTap={this.toggleAddUser}
                            />
                            <MenuItem
                                primaryText="Rediger grupper"
                                containerElement={<Link to="/groups" />}
                            />
                        </IconMenu>
                        : null
                    }
                    <Dialog
                        title="Finn / legg til medlem"
                        open={this.state.addUser}
                        onRequestClose={this.closeAddUser}
                        autoScrollBodyContent
                    >
                        <p>Mens du skriver inn navn, søker vi opp de med likest navn, i tilfelle personen allerede er registrert. For å legge inn en ny person, skriver du hele navnet og trykker enter.</p>
                        <AutoComplete
                            hintText="Navn"
                            dataSource={org.users.map((user) => {
                                return { text: user.name, value: user.id };
                            })}
                            floatingLabelText="Navn"
                            onUpdateInput={this.onChangeUserName}
                            onNewRequest={this.onAutoCompleteChoose}
                            filter={AutoComplete.fuzzyFilter}
                            fullWidth
                        />
                        {this.state.exists
                            ? <div>{this.state.name} finnes i systemet fra før, gå til <Link to={`/users/${this.state.exists.value}`}>brukersiden</Link></div>
                            : null
                        }
                        {this.state.new
                            ? <form onSubmit={this.addUser}>
                                <div>
                                    <TextField
                                        id="email"
                                        floatingLabelText="E-post"
                                        type="email"
                                        value={this.state.email}
                                        onChange={this.onChangeEmail}
                                    />
                                </div>
                                <div>
                                    <TextField
                                        id="instrument"
                                        floatingLabelText="Instrument"
                                        value={this.state.instrument}
                                        onChange={this.onChangeInstrument}
                                    />
                                </div>
                                <div>
                                    <Checkbox
                                        id="member"
                                        label="Gi personen medlemsrettigheter"
                                        checked={this.state.member}
                                        onCheck={this.onCheckMember}
                                    />
                                </div>
                                <div>
                                    <SelectField
                                        id="group"
                                        floatingLabelText="Instrumentgruppe"
                                        value={this.state.groupId}
                                        onChange={this.onChangeGroup}
                                    >
                                        <MenuItem primaryText="(Ingen)" />
                                        {org.instrumentGroups.map((group) => {
                                            return (
                                                <MenuItem
                                                    key={group.id}
                                                    value={group.id}
                                                    primaryText={group.name}
                                                />
                                            );
                                        })}
                                    </SelectField>
                                </div>
                                <div>
                                    <RaisedButton
                                        type="submit"
                                        label="Legg til"
                                        primary
                                    />
                                    <RaisedButton
                                        type="reset"
                                        label="Avbryt"
                                        onTouchTap={this.closeAddUser}
                                    />
                                </div>
                            </form>
                            : <div>
                                <RaisedButton
                                    type="reset"
                                    label="Avbryt"
                                    onTouchTap={this.closeAddUser}
                                />
                            </div>
                        }
                    </Dialog>
                </div>
                {org.instrumentGroups.map((group) => {
                    return (
                        <GroupItem
                            key={group.id}
                            isMember={this.props.organization.isMember}
                            isAdmin={this.props.organization.isAdmin}
                            {...group}
                        />
                    );
                })}
            </Paper>
        );
    }
}

export default Relay.createContainer(Members, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isMember
                isAdmin
                instrumentGroups {
                    id
                    name
                    members {
                        id
                        user {
                            id
                            name
                            username
                            email
                            phone
                            membershipStatus
                            instrument
                        }
                        role {
                            title
                            email
                        }
                    }
                }
                users {
                    id
                    name
                    username
                }
                ${AddUserMutation.getFragment('organization')}
            }`;
        },
    },
});
