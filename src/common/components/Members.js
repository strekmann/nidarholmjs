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
                console.log(results);
                this.setState({ addUser: false });
                this.context.router.push({ pathname: `/users/${results.addUser.newUser.username}` });
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
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Medlemmer</h1>
                    </div>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem
                            primaryText="Finn / legg til medlem"
                            onTouchTap={this.toggleAddUser}
                        />
                    </IconMenu>
                    <Dialog
                        title="Finn / legg til medlem"
                        open={this.state.addUser}
                        onRequestClose={this.closeAddUser}
                        autoScrollBodyContent
                    >
                        <AutoComplete
                            hintText="Navn"
                            dataSource={org.users.map(
                                user => ({ text: user.name, value: user.username })
                            )}
                            floatingLabelText="Navn"
                            onUpdateInput={this.onChangeUserName}
                            onNewRequest={this.onAutoCompleteChoose}
                            filter={AutoComplete.fuzzyFilter}
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
                                        {org.instrumentGroups.map(group => <MenuItem
                                            key={group.id}
                                            value={group.id}
                                            primaryText={group.name}
                                        />)}
                                    </SelectField>
                                </div>
                                <div><RaisedButton type="submit" label="Legg til" primary /></div>
                            </form>
                            : null
                        }
                    </Dialog>
                </div>
                {org.instrumentGroups.map(
                    group => <GroupItem
                        key={group.id}
                        isMember={this.props.organization.isMember}
                        {...group}
                    />
                    )
                }
            </Paper>
        );
    }
}

export default Relay.createContainer(Members, {
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            isMember
            instrumentGroups {
                id
                name
                members {
                    id
                    user {
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
        }`,
    },
});
