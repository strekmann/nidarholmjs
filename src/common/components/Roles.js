import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';
import CreateRoleMutation from '../mutations/createRole';
import DeleteRoleMutation from '../mutations/deleteRole';
import theme from '../theme';

class Roles extends React.Component {
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
        console.log("id", id);
        this.context.relay.commitUpdate(new DeleteRoleMutation({
            id,
            organization: this.props.organization,
        }));
    }

    onSave = (event) => {
        event.preventDefault();
        this.setState({ creating: false });
        const {
            name,
            email,
        } = this.state;
        this.context.relay.commitUpdate(new CreateRoleMutation({
            name,
            email,
            organization: this.props.organization,
        }), {
            onSuccess: () => {
                this.setState({
                    name: '',
                    email: '',
                });
            },
        });
    }

    render() {
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
            <div>
                <Dialog
                    open={this.state.creating}
                    title="Legg til ny rolle"
                    onRequestClose={this.onClose}
                    actions={actions}
                >
                    <div>
                        <TextField
                            floatingLabelText="Verv"
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
                <RaisedButton
                    label="Legg til ny rolle"
                    onTouchTap={() => {
                        this.setState({ creating: true });
                    }}
                />
                <h1>Roller</h1>
                <ul>
                    {this.props.organization.roles.edges.map((edge) => {
                        return (
                            <li key={edge.node.id}>{edge.node.name} ({edge.node.email}) <a href="" onClick={(event) => { this.onDelete(event, edge.node.id); }}>Slett</a></li>
                        );
                    })}
                </ul>
            </div>
        );
    }
}

export default Relay.createContainer(Roles, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                roles(first:100) {
                    edges {
                        node {
                            id
                            name
                            email
                        }
                    }
                }
                ${CreateRoleMutation.getFragment('organization')}
                ${DeleteRoleMutation.getFragment('organization')}
            }`;
        },
    },
});
