import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import React from 'react';
import Relay from 'react-relay';

import SaveOrganizationMutation from '../mutations/saveOrganization';
import theme from '../theme';

import FrontpageSummaries from './FrontpageSummaries';

class Organization extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        term: '',
        summaries: this.props.organization.summaries,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChange = (summaries) => {
        this.setState({ summaries });
    }

    onAdd = (pageId) => {
        const summaries = this.state.summaries;
        summaries.push(pageId);
        this.setState({ summaries });
    }

    saveOrganization = (event) => {
        event.preventDefault();
        this.context.relay.commitUpdate(new SaveOrganizationMutation({
            organization: this.props.organization,
            summaries: this.state.summaries.map((page) => {
                return page.id;
            }),
        }));
    }

    render() {
        const org = this.props.organization;
        return (
            <Paper className="row">
                <h1>Innstillinger</h1>
                <form onSubmit={this.saveOrganization}>
                    <FrontpageSummaries
                        pages={org.pages}
                        summaries={org.summaries}
                        onChange={this.onChange}
                        onAdd={this.onAdd}
                    />
                    <RaisedButton type="submit" label="Lagre" />
                </form>
            </Paper>
        );
    }
}

export default Relay.createContainer(Organization, {
    fragments: {
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                summaries {
                    id
                    title
                    slug
                }
                pages(first:100) {
                    edges {
                        cursor
                        node {
                            id
                            title
                            slug
                        }
                    }
                }
                ${SaveOrganizationMutation.getFragment('organization')}
            }`;
        },
    },
});
