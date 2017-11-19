import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import {
    List,
    ListItem,
} from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Delete from 'material-ui/svg-icons/action/delete';
import PropTypes from 'prop-types';
import React from 'react';
import {
    createFragmentContainer,
    graphql,
} from 'react-relay';

import CreateRoleMutation from '../mutations/CreateRole';
import DeleteRoleMutation from '../mutations/DeleteRole';
import theme from '../theme';

class Roles extends React.Component {
    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    static propTypes = {
        organization: PropTypes.object,
        relay: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        creating: false,
        name: '',
        email: '',
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onClose = () => {
        this.setState({ creating: false });
    }

    onDelete = (event, id) => {
        event.preventDefault();
        DeleteRoleMutation.commit(
            this.props.relay.environment,
            {
                id,
            });
    }

    onSave = (event) => {
        event.preventDefault();
        this.setState({ creating: false });
        const {
            name,
            email,
        } = this.state;
        CreateRoleMutation.commit(
            this.props.relay.environment,
            {
                name,
                email,
            },
            () => {
                this.setState({
                    name: '',
                    email: '',
                });
            },
        );
    }

    render() {
        const { organization } = this.props;
        const { isAdmin } = organization;
        const actions = [
            <RaisedButton
                label="Avbryt"
                onTouchTap={this.onClose}
            />,
            <RaisedButton
                label="Lagre"
                onTouchTap={this.onSave}
                primary
            />,
        ];
        return (
            <Paper className="row">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h1>Verv og roller</h1>
                    {isAdmin
                        ? <IconMenu
                            iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            <MenuItem
                                primaryText="Legg til ny rolle"
                                onTouchTap={() => {
                                    this.setState({ creating: true });
                                }}
                            />
                        </IconMenu>
                        : null
                    }
                </div>
                <Dialog
                    open={this.state.creating}
                    title="Legg til ny rolle"
                    onRequestClose={this.onClose}
                    actions={actions}
                >
                    <div>
                        <TextField
                            floatingLabelText="Rolle"
                            onChange={(_, name) => {
                                this.setState({ name });
                            }}
                            value={this.state.name}
                            required
                        />
                    </div>
                    <div>
                        <TextField
                            floatingLabelText="E-post-alias"
                            onChange={(_, email) => {
                                this.setState({ email });
                            }}
                            value={this.state.email}
                        />
                    </div>
                </Dialog>
                <List>
                    {organization.roles.edges.map((edge) => {
                        const {
                            id,
                            name,
                            email,
                            users,
                        } = edge.node;
                        // <a href="" onClick={(event) => { this.onDelete(event, id); }}>Slett</a>
                        return (
                            <ListItem
                                key={id}
                                primaryText={name}
                                secondaryText={email}
                                style={{ textTransform: 'uppercase' }}
                                disabled
                                initiallyOpen
                                rightIconButton={
                                    <IconButton
                                        onTouchTap={(event) => { this.onDelete(event, id); }}
                                    >
                                        <Delete />
                                    </IconButton>
                                }
                                nestedItems={users.map((user) => {
                                    return (
                                        <ListItem
                                            key={user.id}
                                            primaryText={user.name}
                                            secondaryText={user.email}
                                            disabled
                                            insetChildren
                                        />
                                    );
                                })}
                            />
                        );
                    })}
                </List>
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Roles,
    {
        organization: graphql`
        fragment Roles_organization on Organization {
            isAdmin
            roles(first:100) {
                edges {
                    node {
                        id
                        name
                        email
                        users {
                            id
                            name
                            email
                        }
                    }
                }
            }
        }`,
    },
);
