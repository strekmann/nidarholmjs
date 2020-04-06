/* eslint "max-len": 0 */
/* eslint "react/no-multi-comp": 0 */

import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";
import AddCircle from "material-ui/svg-icons/content/add-circle";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import SaveContactRolesMutation from "../mutations/SaveContactRoles";
import theme from "../theme";

import SortableRoleList from "./SortableRoleList";
import { ContactRoles_organization } from "./__generated__/ContactRoles_organization.graphql";

type ItemProps = {
  // id: string,
  name: string;
  onAddRole: (any) => void;
};

class RoleItem extends React.Component<ItemProps> {
  addRole = () => {
    this.props.onAddRole(this.props);
  };

  render() {
    const addIcon = (
      <IconButton onClick={this.addRole}>
        <AddCircle />
      </IconButton>
    );
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexGrow: 1 }}>{this.props.name}</div>
        <div>{addIcon}</div>
      </div>
    );
  }
}

type Props = {
  organization: ContactRoles_organization;
  relay: {
    environment: {};
  };
  saveHook: () => void;
};

type State = {
  activeRoles: Array<{
    id: string;
    name: string;
  }>;
  contactRoles: Array<{
    id: string;
    name: string;
  }>;
};

class ContactRoles extends React.Component<Props, State> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    const { activeRoles, contactRoles } = props.organization;
    this.state = {
      activeRoles: [...activeRoles],
      contactRoles: [...contactRoles],
    };
    this.muiTheme = getMuiTheme(theme);
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onChange = (contactRoles) => {
    this.setState({ contactRoles });
  };

  onAdd = ({ id, name }) => {
    const { contactRoles } = this.state;
    contactRoles.push({ id, name });
    this.setState({ contactRoles });
  };

  saveContactRoles = (event) => {
    event.preventDefault();
    const { relay } = this.props;
    SaveContactRolesMutation.commit(
      relay.environment,
      {
        contactRoles: this.state.contactRoles.map((role) => {
          return role.id;
        }),
      },
      () => {
        this.props.saveHook();
      },
    );
  };

  muiTheme: {};

  render() {
    const roleIds = this.state.contactRoles.map((role) => {
      return role.id;
    });
    return (
      <div>
        <h2>Kontakter</h2>
        <p>
          Hvilke roller skal vises i hvilken rekkefølge på kontaktsiden. Velg
          blant besatte roller.
        </p>
        <form onSubmit={this.saveContactRoles}>
          <div style={{ display: "flex" }}>
            <div>
              <h3>Valgte</h3>
              <SortableRoleList
                roles={this.state.contactRoles}
                onChange={this.onChange}
              />
            </div>
            <div>
              <h3>Mulige</h3>
              <div
                style={{ height: 400, overflow: "scroll", overflowX: "hidden" }}
              >
                {this.state.activeRoles
                  .filter((role) => {
                    return !roleIds.includes(role.id);
                  })
                  .map((role) => {
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
          <RaisedButton label="Lagre" type="submit" />
        </form>
      </div>
    );
  }
}

export default createFragmentContainer(ContactRoles, {
  organization: graphql`
    fragment ContactRoles_organization on Organization {
      id
      activeRoles {
        id
        name
      }
      contactRoles {
        id
        name
      }
    }
  `,
});
