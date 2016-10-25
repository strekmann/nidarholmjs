import Paper from 'material-ui/Paper';
import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import SortablePageList from './SortablePageList';
import theme from '../theme';

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

    render() {
        const org = this.props.organization;
        return (
            <Paper className="row">
                <h1>Innstillinger</h1>
                <h2>Forsidesnutter</h2>
                <p>Hvor mange som vises er avhengig av hvordan forsida er definert. Du kan trykke pluss i den nederste lista for å legge dem til, eller minus i den øverste for å fjerne dem.</p>
                <h3>Valgt</h3>
                <SortablePageList pages={this.state.summaries} onChange={this.onChange} />
                <h3>Mulige</h3>
                <div>
                    {org.pages.edges.map(edge => <div>{edge.node.title} ({edge.node.slug})</div>)}
                </div>
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
                    node {
                        title
                        slug
                    }
                }
            }
        }`,
    },
});
