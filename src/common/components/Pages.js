/* @flow */

import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import PropTypes from 'prop-types';
import * as React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';

import AddPageMutation from '../mutations/AddPage';
import theme from '../theme';

import EditPage from './EditPage';
import PageList from './PageList';

type Props = {
    organization: {
        isAdmin: boolean,
        isMember: boolean,
        memberGroup: {
            id: string,
        },
        pages: {
            edges: Array<{
                node: {
                    id: string,
                    slug: string,
                    title: string,
                    permissions: Array<{}>,
                    creator: {
                        name: string,
                    },
                    created: string,
                    updator: {
                        name: string,
                    },
                    updated: string,
                },
            }>,
            pageInfo: {
                hasNextPage: boolean,
            },
        },
    },
    relay: {
        environment: {},
    },
    viewer: {
        friends: Array<{
            id: string,
            name: string,
        }>,
        groups: Array<{
            id: string,
            name: string,
        }>,
    },
}

type State = {
    addPage: boolean,
    page: {
        id: ?string,
        slug: string,
        mdtext: string,
        title: string,
        summary: string,
        permissions: Array<{
            id: string,
            name: string,
        }>,
    }
}

class Pages extends React.Component<Props, State> {
    muiTheme: {};

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
            id: null,
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

    addPage = (page) => {
        const { relay } = this.props;
        AddPageMutation.commit(relay.environment, page, () => {
            this.closeAddPage();
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
                        savePage={this.addPage}
                        {...this.state.page}
                    />
                    : (
                        <div>
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
                            {org.pages.pageInfo.hasNextPage
                                ? <RaisedButton primary>Mer</RaisedButton>
                                : null
                            }
                        </div>
                    )
                }
            </Paper>
        );
    }
}

export default createRefetchContainer(
    Pages,
    {
        viewer: graphql`
        fragment Pages_viewer on User {
            groups {
                id
                name
            }
        }`,
        organization: graphql`
        fragment Pages_organization on Organization
        @argumentDefinitions(
            showPages: {type: "Int", defaultValue: 20}
        ) {
            id
            isMember
            memberGroup {
                id
            }
            isAdmin
            pages(first: $showPages) {
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
        }`,
    },
);
