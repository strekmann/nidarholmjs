/* eslint "max-len": 0 */
/* eslint "react/no-multi-comp": 0 */

import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';

import SaveContactRolesMutation from '../mutations/saveContactRoles';
import theme from '../theme';

import SortableRoleList from './SortableRoleList';

class RoleItem extends React.Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        onAddRole: PropTypes.func.isRequired,
    }

    addRole = () => {
        this.props.onAddRole(this.props);
    }

    render() {
        const addIcon = <IconButton onClick={this.addRole}><AddCircle /></IconButton>;
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>{this.props.name}</div>
                <div>{addIcon}</div>
            </div>
        );
    }
}

class ContactRoles extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: PropTypes.object,
        saveHook: PropTypes.func,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        activeRoles: this.props.organization.activeRoles,
        contactRoles: this.props.organization.contactRoles,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChangeSummaries = (summaries) => {
        this.setState({ summaries });
    }

    onChange = (contactRoles) => {
        this.setState({ contactRoles });
    }

    onAdd = (roleId) => {
        const { contactRoles } = this.state;
        contactRoles.push(roleId);
        this.setState({ contactRoles });
    }

    saveContactRoles = (event) => {
        event.preventDefault();
        this.context.relay.commitUpdate(new SaveContactRolesMutation({
            organization: this.props.organization,
            contactRoles: this.state.contactRoles,
        }), {
            onSuccess: () => {
                this.props.saveHook();
            },
        });
    }

    render() {
        return (
            <div>
                <h2>Kontakter</h2>
                <p>Hvilke roller skal vises i hvilken rekkefølge på kontaktsiden. Velg blant besatte roller.</p>
                <form onSubmit={this.saveContactRoles}>
                    <div style={{ display: 'flex' }}>
                        <div>
                            <h3>Valgte</h3>
                            <SortableRoleList
                                roles={this.state.contactRoles}
                                onChange={this.onChange}
                            />
                        </div>
                        <div>
                            <h3>Mulige</h3>
                            <div style={{ height: 400, overflow: 'scroll', overflowX: 'hidden' }}>
                                {this.state.activeRoles.map((role) => {
                                    return (
                                        <RoleItem
                                            key={role.id}
                                            onAddRole={this.onAdd}
                                            {...role}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <RaisedButton
                        label="Lagre"
                        type="submit"
                    />
                </form>
            </div>
        );
    }
}

export default Relay.createContainer(ContactRoles, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                activeRoles {
                    id
                    name
                }
                contactRoles {
                    id
                    name
                }
                ${SaveContactRolesMutation.getFragment('organization')}
            }`;
        },
    },
});
