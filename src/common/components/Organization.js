/* eslint "max-len": 0 */
/* eslint "react/no-multi-comp": 0 */

import IconButton from 'material-ui/IconButton';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import Paper from 'material-ui/Paper';
import React, { PropTypes } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import SaveOrganizationMutation from '../mutations/saveOrganization';
import theme from '../theme';
import SortablePageList from './SortablePageList';

class PageSummaryItem extends React.Component {
    static propTypes = {
        slug: PropTypes.string.isRequired,
        title: PropTypes.string,
        onAddSummary: PropTypes.func.isRequired,
    }
    addSummary = () => {
        this.props.onAddSummary(this.props);
    }

    render() {
        const { title, slug } = this.props;
        const addIcon = <IconButton onClick={this.addSummary}><AddCircle /></IconButton>;
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                    <div>{title}</div>
                    <div>/{slug}</div>
                </div>
                <div>{addIcon}</div>
            </div>
        );
    }
}

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

    onAddSummary = (pageId) => {
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
                    <h2>Forsidesnutter</h2>
                    <p>Hvor mange som vises er avhengig av hvordan forsida er definert. Du kan trykke pluss i den nederste lista for å legge dem til, eller minus i den øverste for å fjerne dem.</p>
                    <div style={{ display: 'flex' }}>
                        <div>
                            <h3>Valgt</h3>
                            <SortablePageList pages={this.state.summaries} onChange={this.onChange} />
                            <RaisedButton type="submit" label="Lagre" />
                        </div>
                        <div>
                            <h3>Mulige</h3>
                            <div style={{ height: 400, overflow: 'scroll', overflowX: 'hidden' }}>
                                {org.pages.edges.map((edge) => {
                                    return (
                                        <PageSummaryItem
                                            key={edge.cursor}
                                            onAddSummary={this.onAddSummary}
                                            {...edge.node}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
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
                memberGroup {
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
            }`;
        },
    },
});
