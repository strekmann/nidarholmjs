import IconButton from 'material-ui/IconButton';
import { List, ListItem } from 'material-ui/List';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import Paper from 'material-ui/Paper';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import SaveOrganizationMutation from '../mutations/saveOrganization';
import SortablePageList from './SortablePageList';
import theme from '../theme';

class PageItem extends React.Component {
    addSummary = () => {
        this.props.onAddSummary(this.props);
    }

    render() {
        const { title, slug } = this.props;
        const add = <IconButton onClick={this.addSummary}><AddCircle /></IconButton>;
        return (
            <ListItem primaryText={title} secondaryText={slug} rightIconButton={add} />
        );
    }
}

class Organization extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
        relay: React.PropTypes.object,
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

    onAddSummary = (pageId) => {
        const summaries = this.state.summaries;
        summaries.push(pageId);
        this.setState({ summaries });
    }

    saveOrganization = (event) => {
        event.preventDefault();
        this.context.relay.commitUpdate(new SaveOrganizationMutation({
            organization: this.props.organization,
            summaries: this.state.summaries.map(page => page.id),
        }));
    }

    render() {
        const org = this.props.organization;
        return (
            <Paper className="row">
                <h1>Innstillinger</h1>
                <form onSubmit={this.saveOrganization}>
                    <h2>Forsidesnutter</h2>
                    <p>Hvor mange som vises er avhengig av hvordan forsida er definert. Du kan trykke pluss i den nederste lista for å legge dem til, eller minus i den øverste for å fjerne dem.</p>
                    <h3>Valgt</h3>
                    <SortablePageList pages={this.state.summaries} onChange={this.onChange} />
                    <RaisedButton type="submit" label="Lagre" />
                    <h3>Mulige</h3>
                    <List>
                        {org.pages.edges.map(edge => <PageItem key={edge.cursor} onAddSummary={this.onAddSummary} {...edge.node} />)}
                    </List>
                </form>
            </Paper>
        );
    }
}

export default Relay.createContainer(Organization, {
    fragments: {
        organization: () => Relay.QL`
        fragment on Organization {
            id
            member_group {
                id
            }
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
        }`,
    },
});
