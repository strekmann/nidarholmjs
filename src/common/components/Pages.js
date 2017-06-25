import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import AddPageMutation from '../mutations/addPage';
import theme from '../theme';

import EditPage from './EditPage';
import PageList from './PageList';

const itemsPerPage = 20;

class Pages extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: PropTypes.object,
        organization: PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
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
        });
    }

    render() {
        const org = this.props.organization;
        if (!org.isMember) {
            return <div />;
        }
        return (
            <Paper className="row">
                {this.state.addPage
                    ? <EditPage
                        viewer={this.props.viewer}
                        savePage={this.savePage}
                        {...this.state.page}
                    />
                    : <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h1>Sider</h1>
                            </div>
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem primaryText="Legg til side" onTouchTap={this.toggleAddPage} />
                            </IconMenu>
                        </div>
                        <PageList
                            pages={org.pages}
                            isAdmin={org.isAdmin}
                            memberGroupId={org.memberGroup.id}
                        />
                        {org.pages.pageInfo.hasNextPage ?
                            <RaisedButton primary>Mer</RaisedButton>
                            :
                                null
                        }
                    </div>
                }
            </Paper>
        );
    }

}

export default Relay.createContainer(Pages, {
    initialVariables: {
        showPages: itemsPerPage,
    },
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                groups {
                    id
                    name
                }
            }`;
        },
        organization: () => {
            return Relay.QL`
            fragment on Organization {
                id
                isMember
                memberGroup {
                    id
                }
                isAdmin
                pages(first:$showPages) {
                    edges {
                        node {
                            id
                            slug
                            mdtext
                            title
                            summary
                            creator {
                                name
                            }
                            created
                            updator {
                                name
                            }
                            updated
                            permissions {
                                public
                                groups {
                                    id
                                    name
                                }
                            }
                        }
                    }
                    pageInfo {
                        hasNextPage
                    }
                }
                ${AddPageMutation.getFragment('organization')},
            }`;
        },
    },
});
