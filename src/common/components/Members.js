import Link from 'found/lib/Link';
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
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import AddUserMutation from '../mutations/AddUser';
import theme from '../theme';

import GroupItem from './GroupItem';

class Members extends React.Component {
    static propTypes = {
        organization: PropTypes.object,
        relay: PropTypes.object.isRequired,
        router: PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
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
        const { relay } = this.props;
        const {
            name, email, instrument, member, groupId,
        } = this.state;
        AddUserMutation.commit(
            relay.environment,
            {
                name,
                email,
                instrument,
                isMember: !!member,
                groupId,
            }, (results) => {
                this.setState({ addUser: false });
                this.props.router.push({ pathname: `/users/${results.addUser.newUser.id}` });
            },
        );
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
        const { organization } = this.props;
        const {
            instrumentGroups, isAdmin, isMember, users,
        } = organization;
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Medlemmer</h1>
                    </div>
                    {isAdmin
                        ? <IconMenu
                            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Finn / legg til medlem"
                                onTouchTap={this.toggleAddUser}
                            />
                            <MenuItem
                                primaryText="Grupper"
                                containerElement={<Link to="/groups" />}
                            />
                            <MenuItem
                                primaryText="Verv og roller"
                                containerElement={<Link to="/members/roles" />}
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
                        <p>Mens du skriver inn navn, søker vi opp de med likest navn, i tilfelle
                        personen allerede er registrert. For å legge inn en ny person, skriver du
                        hele navnet og trykker enter.</p>
                        <AutoComplete
                            hintText="Navn"
                            dataSource={users.map((user) => {
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
                                        {instrumentGroups.map((group) => {
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
                {instrumentGroups.map((group) => {
                    return (
                        <GroupItem
                            group={group}
                            key={group.id}
                            isMember={isMember}
                            isAdmin={isAdmin}
                        />
                    );
                })}
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Members,
    {
        organization: graphql`
        fragment Members_organization on Organization {
            isMember
            isAdmin
            instrumentGroups {
                id
                name
                ...GroupItem_group
            }
            users {
                id
                name
                username
            }
        }`,
    },
);
