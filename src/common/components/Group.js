import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import { List, ListItem } from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import { Link } from 'react-router';
import Relay from 'react-relay';
import theme from '../theme';
import AddRoleMutation from '../mutations/addRole';
import JoinGroupMutation from '../mutations/joinGroup';
import LeaveGroupMutation from '../mutations/leaveGroup';
import RemoveRoleMutation from '../mutations/removeRole';

class Group extends React.Component {
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
        joinGroup: false,
        addingGroupLeader: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    setGroupLeader = (role) => {
        this.context.relay.commitUpdate(new AddRoleMutation({
            roleId: role.value,
            member: this.state.addingGroupLeader,
        }));
        this.setState({ addingGroupLeader: false });
    }

    joinGroup = (selection) => {
        this.setState({ joinGroup: false });
        this.context.relay.commitUpdate(new JoinGroupMutation({
            group: this.props.organization.group,
            user: selection.value,
        }));
    }

    leaveGroup = (user, group) => {
        this.context.relay.commitUpdate(new LeaveGroupMutation({
            group,
            user,
        }));
    }

    closeJoinGroup = () => {
        this.setState({ joinGroup: false });
    }

    toggleGroupLeader = (member, isGroupLeader) => {
        if (isGroupLeader) {
            // remove group leader status
            // FIXME: We assume the first role for this group is a group leader
            // role. We also assume that there is a role set when we get
            // isGroupLeader.
            const role = member.roles[0];
            this.context.relay.commitUpdate(new RemoveRoleMutation({
                roleId: role.id,
                member,
            }));
        }
        else {
            // add group leader status
            this.setState({ addingGroupLeader: member });
        }
    }

    closeAddingGroupLeader = () => {
        this.setState({ addingGroupLeader: false });
    }

    render() {
        const org = this.props.organization;
        const { group, isAdmin, roles } = org;
        const members = group.members.filter((member) => {
            return member.user;
        });
        members.sort((a, b) => {
            if (a.user.name > b.user.name) {
                return 1;
            }
            return -1;
        });
        return (
            <section>
                {isAdmin
                        ? <Paper style={{ padding: 20 }}>
                            <Dialog
                                title="Legg til gruppemedlem"
                                open={this.state.joinGroup}
                                onRequestClose={this.closeJoinGroup}
                                autoScrollBodyContent
                                actions={<FlatButton label="Avbryt" onTouchTap={this.closeJoinGroup} />}
                            >
                                <AutoComplete
                                    dataSource={org.users.map((user) => {
                                        return { text: `${user.name} (${user.username})`, value: user };
                                    })}
                                    floatingLabelText="Navn"
                                    onNewRequest={this.joinGroup}
                                    filter={AutoComplete.fuzzyFilter}
                                    fullWidth
                                />
                            </Dialog>
                            <Link to="/groups">Alle grupper</Link>
                            <FlatButton
                                label="Legg til gruppemedlem"
                                onTouchTap={() => {
                                    this.setState({ joinGroup: !this.state.joinGroup });
                                }}
                                style={{ float: 'right' }}
                            />
                            <h1>{group.name}</h1>
                            <List>
                                {members.map((member) => {
                                    const isGroupLeader = member.roles.some((role) => {
                                        return !!role.name;
                                    });
                                    return (
                                        <div
                                            key={member.id}
                                        >
                                            <Dialog
                                                title="Sett som gruppeleder"
                                                open={!!this.state.addingGroupLeader}
                                                onRequestClose={this.closeAddingGroupLeader}
                                            >
                                                <p>Velg en rolle fra lista under</p>
                                                <AutoComplete
                                                    dataSource={roles.edges.map((edge) => {
                                                        return { text: edge.node.name, value: edge.node.id };
                                                    })}
                                                    floatingLabelText="Rolle"
                                                    onNewRequest={this.setGroupLeader}
                                                    openOnFocus
                                                    filter={AutoComplete.fuzzyFilter}
                                                    fullWidth
                                                />
                                            </Dialog>
                                            <ListItem
                                                disabled
                                                primaryText={member.user.name}
                                                secondaryText={member.roles.map((role) => {
                                                    return role.name;
                                                }).join(', ')}
                                                rightIconButton={
                                                    <IconMenu
                                                        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                                                    >
                                                        <MenuItem
                                                            primaryText="Gå til brukerside"
                                                            insetChildren
                                                            containerElement={<Link to={`/users/${member.user.id}`} />}
                                                        />
                                                        <MenuItem
                                                            primaryText="Fjern fra gruppe"
                                                            insetChildren
                                                            onClick={(event) => {
                                                                event.preventDefault();
                                                                return this.leaveGroup(member.user, group);
                                                            }}
                                                        />
                                                        <MenuItem
                                                            primaryText="Gruppeleder"
                                                            checked={isGroupLeader}
                                                            insetChildren
                                                            onClick={() => {
                                                                this.toggleGroupLeader(member, isGroupLeader);
                                                            }}
                                                        />
                                                    </IconMenu>
                                                }
                                            />
                                        </div>
                                    );
                                })}
                            </List>
                        </Paper>
                        : null
                }
            </section>
        );
    }
}

export default Relay.createContainer(Group, {
    initialVariables: {
        groupId: null,
    },
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
            }
            `;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                isAdmin
                users {
                    id
                    name
                    username
                }
                group(groupId:$groupId) {
                    id
                    name
                    members {
                        id
                        user(active:true) {
                            id
                            name
                            ${JoinGroupMutation.getFragment('user')}
                            ${LeaveGroupMutation.getFragment('user')}
                        }
                        roles {
                            id
                            name
                        }
                        ${AddRoleMutation.getFragment('member')}
                        ${RemoveRoleMutation.getFragment('member')}
                    }
                    externallyHidden
                }
                roles(first:100) {
                    edges {
                        node {
                            id
                            name

                        }
                    }
                }
            }`;
        },
    },
});
