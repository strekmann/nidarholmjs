/* eslint "max-len": 0 */
/* eslint "react/no-multi-comp": 0 */

// @flow

import type { RelayProp } from "react-relay";
import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";
import AddCircle from "material-ui/svg-icons/content/add-circle";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import * as React from "react";
import { createFragmentContainer, graphql } from "react-relay";

import SaveContactRolesMutation from "../mutations/SaveContactRoles";
import theme from "../theme";

import SortableRoleList from "./SortableRoleList";
import type { ContactRoles_organization as OrganizationType } from "./__generated__/ContactRoles_organization.graphql";
import type { Role } from "./SortableRoleList";

type ItemProps = {
  // id: string,
  name: string,
  onAddRole: (any) => void,
};

class RoleItem extends React.Component<ItemProps> {
  addRole = () => {
    const { onAddRole } = this.props;
    onAddRole(this.props);
  };

  render() {
    const { name } = this.props;
    const addIcon = (
      <IconButton onClick={this.addRole}>
        <AddCircle />
      </IconButton>
    );
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexGrow: 1 }}>{name}</div>
        <div>{addIcon}</div>
      </div>
    );
  }
}

type Props = {
  organization: OrganizationType,
  relay: RelayProp,
  saveHook: () => void,
};

type State = {
  activeRoles: Array<Role>,
  contactRoles: Array<Role>,
};

class ContactRoles extends React.Component<Props, State> {
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
    const { relay, saveHook } = this.props;
    const { contactRoles } = this.state;
    SaveContactRolesMutation.commit(
      relay.environment,
      {
        contactRoles: contactRoles.map((role) => {
          return role.id;
        }),
      },
      () => {
        saveHook();
      },
    );
  };

  muiTheme: {};

  render() {
    const { activeRoles, contactRoles } = this.state;
    const roleIds = contactRoles.map((role) => {
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
              <SortableRoleList roles={contactRoles} onChange={this.onChange} />
            </div>
            <div>
              <h3>Mulige</h3>
              <div
                style={{ height: 400, overflow: "scroll", overflowX: "hidden" }}
              >
                {activeRoles
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
