import update from 'immutability-helper';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import SaveOrganizationMutation from '../mutations/SaveOrganization';
import theme from '../theme';

import FrontpageSummaries from './FrontpageSummaries';

class Organization extends React.Component {
    static propTypes = {
        organization: PropTypes.object,
        relay: PropTypes.object.isRequired,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        summaries: this.props.organization.summaries,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChange = (summaries) => {
        this.setState({ summaries });
    }

    onAdd = (page) => {
        this.setState(update(this.state, {
            summaries: {
                $push: [page],
            },
        }));
    }

    saveOrganization = (event) => {
        event.preventDefault();
        SaveOrganizationMutation.commit(
            this.props.relay.environment,
            {
                summaryIds: this.state.summaries.map((page) => {
                    return page.id;
                }),
            },
        );
    }

    render() {
        const org = this.props.organization;
        return (
            <Paper className="row">
                <h1>Innstillinger</h1>
                <form onSubmit={this.saveOrganization}>
                    <FrontpageSummaries
                        pages={org.pages}
                        summaries={this.state.summaries}
                        onChange={this.onChange}
                        onAdd={this.onAdd}
                    />
                    <RaisedButton type="submit" label="Lagre" />
                </form>
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Organization,
    {
        organization: graphql`
        fragment Organization_organization on Organization {
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
        }`,
    },
);
