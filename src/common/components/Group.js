import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Close from 'material-ui/svg-icons/navigation/close';
import React from 'react';
import { Link } from 'react-router';
import Relay from 'react-relay';

import theme from '../theme';
import JoinGroupMutation from '../mutations/joinGroup';
import LeaveGroupMutation from '../mutations/leaveGroup';

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
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
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

    render() {
        const org = this.props.organization;
        const { group, isAdmin } = org;
        const members = group.members.filter((member) => {
            return member.user;
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
                                {members.sort((a, b) => {
                                    return a.user.name > b.user.name;
                                }).map((member) => {
                                    return (
                                        <ListItem
                                            key={member.id}
                                            containerElement={
                                                <Link to={`/users/${member.user.id}`} />
                                            }
                                            primaryText={member.user.name}
                                            secondaryText={member.role.title}
                                            rightIconButton={isAdmin
                                                ? <IconButton
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        return this.leaveGroup(member.user, group);
                                                    }}
                                                >
                                                    <Close />
                                                </IconButton>
                                                : null
                                            }
                                        />
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
                        user {
                            id
                            name
                            ${JoinGroupMutation.getFragment('user')}
                            ${LeaveGroupMutation.getFragment('user')}
                        }
                        role {
                            title
                        }
                    }
                    externallyHidden
                }
            }
            `;
        },
    },
});
