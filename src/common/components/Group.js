import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Close from 'material-ui/svg-icons/navigation/close';
import React from 'react';
import Relay from 'react-relay';

import theme from '../theme';
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

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    removeMember(member, group) {
        this.context.relay.commitUpdate(new RemoveMemberMutation({
            group,
            member,
        }));
    }

    render() {
        const { group } = this.props.organization;
        return (
            <section>
                <Paper style={{ padding: 20 }}>
                    <h1>{group.name}</h1>
                    {group.members.map(member => (
                        member.user
                        ? <div key={member.id}>
                            {member.user.name} <small>{member.role.title}</small>
                            <IconButton onTouchTap={() => this.removeMember(member, group)}>
                                <Close />
                            </IconButton>
                        </div>
                        : null
                    ))}
                </Paper>
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
                ${RemoveMemberMutation.getFragment('group')}
            }
        }
        `,
    },
});
