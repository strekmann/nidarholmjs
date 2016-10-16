import React from 'react';
import Relay from 'react-relay';

import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';
import Dialog from 'material-ui/Dialog';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import AddPageMutation from '../mutations/addPage';
import EditPage from './EditPage';
import PageList from './PageList';
import theme from '../theme';

const itemsPerPage = 20;

class Pages extends React.Component {
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
        addPage: false,
        page: {
            slug: '',
            mdtext: '',
            title: '',
            summary: '',
            permissions: [],
        },
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    toggleAddPage = () => {
        this.setState({ addPage: !this.state.addPage });
    }

    closeAddPage = () => {
        this.setState({ addPage: false });
    }

    savePage = (page) => {
        this.context.relay.commitUpdate(new AddPageMutation({
            organization: this.props.organization,
            slug: page.slug,
            mdtext: page.mdtext,
            title: page.title,
            summary: page.summary,
            permissions: page.permissions,
        }), {
            onSuccess: () => {
                this.closeAddPage();
            },
            onFailure: (error, ost, kake) => {
                console.error('AD', error, ost, kake);
            },
        });
    }

    render() {
        const viewer = this.props.viewer;
        const org = this.props.organization;
        return (
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <h1>Sider</h1>
                    </div>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem primaryText="Legg til side" onTouchTap={this.toggleAddPage} />
                    </IconMenu>
                </div>
                <PageList
                    pages={org.pages}
                />
                {org.pages.pageInfo.hasNextPage ?
                    <RaisedButton primary>Mer</RaisedButton>
                    :
                    null
                }
                {viewer ?
                    <Dialog
                        title="Legg til side"
                        open={this.state.addPage}
                        onRequestClose={this.closeAddPage}
                        autoScrollBodyContent
                    >
                        <EditPage
                            viewer={this.props.viewer}
                            savePage={this.savePage}
                            {...this.state.page}
                        />
                    </Dialog>
                : null }
            </section>
        );
    }

}

export default Relay.createContainer(Pages, {
    initialVariables: {
        showPages: itemsPerPage,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            groups {
                id
                name
            }
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            id
            member_group {
                id
            }
            pages(first:$showPages) {
                edges {
                    node {
                        id
                        slug
                        mdtext
                        title
                        summary
                        permissions {
                            public
                            groups {
                                id
                                name
                            }
                            users {
                                id
                                name
                            }
                        }
                        created
                    }
                }
                pageInfo {
                    hasNextPage
                }
            }
            ${AddPageMutation.getFragment('organization')},
        }`,
    },
});
