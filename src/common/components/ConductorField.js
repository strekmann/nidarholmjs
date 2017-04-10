import AutoComplete from 'material-ui/AutoComplete';
import Chip from 'material-ui/Chip';
import React from 'react';
import Relay from 'react-relay';

class ConductorField extends React.Component {
    static propTypes = {
        organization: React.PropTypes.object,
        conductors: React.PropTypes.array,
        onChange: React.PropTypes.func.isRequired,
    }

    state = {
        conductor: '',
        conductors: this.props.conductors || [],
    }

    onConductorChange = (conductor) => {
        this.setState({ conductor });
    }

    addConductor = (conductor) => {
        const { conductors } = this.state;
        conductors.push(conductor);
        this.setState({
            conductors,
            conductor: '',
        });
        this.props.onChange(conductors);
    }

    removeConductor = (conductor) => {
        const conductors = this.state.conductors.filter((c) => {
            return c.id !== conductor.id;
        });
        this.setState({ conductors });
        this.props.onChange(conductors);
    }

    render() {
        if (!this.props.organization) {
            return null;
        }
        const conductors = this.props.organization.users;
        return (
            <div>
                <AutoComplete
                    id="conductors"
                    floatingLabelText="Dirigenter"
                    filter={AutoComplete.fuzzyFilter}
                    dataSource={conductors}
                    dataSourceConfig={{ text: 'name', value: 'id' }}
                    maxSearchResults={20}
                    searchText={this.state.conductor}
                    onNewRequest={this.addConductor}
                    onUpdateInput={this.onConductorChange}
                />
                {this.state.conductors.map((conductor) => {
                    return (
                        <Chip
                            key={conductor.id}
                            onRequestDelete={() => {
                                this.removeConductor(conductor);
                            }}
                        >
                            {conductor.name}
                        </Chip>
                    );
                })}
            </div>
        );
    }
}

export default Relay.createContainer(ConductorField, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                users {
                    id
                    name
                }
            }`;
        },
    },
});

