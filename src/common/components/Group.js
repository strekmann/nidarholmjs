import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Close from 'material-ui/svg-icons/navigation/close';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
import AddMemberMutation from '../mutations/addMember';
import RemoveMemberMutation from '../mutations/removeMember';

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
        addMember: false,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    addMember = (selection) => {
        this.closeAddMember();
        this.context.relay.commitUpdate(new AddMemberMutation({
            group: this.props.organization.group,
            user: selection.value,
        }));
    }

    removeMember = (member, group) => {
        this.context.relay.commitUpdate(new RemoveMemberMutation({
            group,
            member,
        }));
    }

    closeAddMember = () => {
        this.setState({ addMember: false });
    }

    render() {
        const org = this.props.organization;
        const { group, isAdmin } = org;
        const members = group.members.filter(member => member.user);
        return (
            <section>
                {isAdmin
                        ? <Paper style={{ padding: 20 }}>
                            <Dialog
                                title="Legg til gruppemedlem"
                                open={this.state.addMember}
                                onRequestClose={this.closeAddMember}
                                autoScrollBodyContent
                            >
                                <AutoComplete
                                    dataSource={org.users.map(
                                        user => ({ text: `${user.name} (${user.username})`, value: user })
                                    )}
                                    floatingLabelText="Navn"
                                    onNewRequest={this.addMember}
                                    filter={AutoComplete.fuzzyFilter}
                                />
                            </Dialog>
                            <FlatButton
                                label="Legg til gruppemedlem"
                                onTouchTap={() => {
                                    this.setState({ addMember: !this.state.addMember });
                                }}
                                style={{ float: 'right' }}
                            />
                            <h1>{group.name}</h1>
                            {members.sort((a, b) => a.user.name > b.user.name).map(member => (
                                <div key={member.id}>
                                    {member.user.name} <small>{member.role.title}</small>
                                    <IconButton onTouchTap={() => this.removeMember(member, group)}>
                                        <Close />
                                    </IconButton>
                                </div>
                            ))}
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
        viewer: () => Relay.QL`
        fragment on User {
            id
        }
        `,
        organization: () => Relay.QL`
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
                        name
                    }
                    role {
                        title
                    }
                }
                externallyHidden
                ${AddMemberMutation.getFragment('group')}
                ${RemoveMemberMutation.getFragment('group')}
            }
        }
        `,
    },
});
