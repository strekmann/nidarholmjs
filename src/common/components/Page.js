import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import PropTypes from 'prop-types';

import EditPageMutation from '../mutations/EditPage';
import theme from '../theme';
import { flattenPermissions } from '../utils';

import EditPage from './EditPage';
import Text from './Text';

type Props = {
    viewer: {},
    organization: {
        page: {
            permissions: [],
        },
    },
    location: {},
    relay: {
        environment: {},
    },
}

class Page extends React.Component<Props> {
    static childContextTypes = {
        muiTheme: PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        edit: false,
        permissions: this.props.organization.page &&
        flattenPermissions(this.props.organization.page.permissions),
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    toggleEdit = () => {
        this.setState({
            edit: !this.state.edit,
        });
    }

    closeEdit = () => {
        this.setState({
            edit: false,
        });
    }

    savePage = (page) => {
        const { relay } = this.props;
        EditPageMutation.commit(relay.environment, page, () => {
            this.closeEdit();
        });
    }

    render() {
        const { location, organization } = this.props;
        const { isMember } = organization;
        if (!organization.page || !organization.page.slug) {
            return (
                <Paper className="row">
                    <h1>Ikke funnet: {location.pathname}</h1>
                    <p>Denne sida fins ikke</p>
                </Paper>
            );
        }
        if (this.state.edit) {
            const page = { ...organization.page };
            page.permissions = this.state.permissions;
            return (
                <EditPage
                    viewer={this.props.viewer}
                    savePage={this.savePage}
                    {...page}
                />
            );
        }
        return (
            <Paper className="row">
                {isMember
                    ? (
                        <div style={{ float: 'right' }}>
                            <IconMenu
                                iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                            </IconMenu>
                        </div>
                    )
                    : null
                }
                <Text text={organization.page.mdtext} />
            </Paper>
        );
    }
}

export default createFragmentContainer(
    Page,
    {
        organization: graphql`
        fragment Page_organization on Organization {
            isMember
            memberGroup {
                id
            }
            page(slug: $slug) {
                id
                slug
                title
                summary
                mdtext
                permissions {
                    public
                    groups {
                        id
                        name
                    }
                }
                created
                updated
                updator {
                    name
                }
            }
        }`,
        viewer: graphql`
        fragment Page_viewer on User {
            id
            groups {
                id
                name
            }
        }`,
    },
);
