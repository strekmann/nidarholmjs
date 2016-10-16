import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import EditPage from './EditPage';
import EditPageMutation from '../mutations/editPage';
import Text from './Text';
import { flattenPermissions } from '../utils';
import theme from '../theme';

class Page extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        viewer: React.PropTypes.object,
        organization: React.PropTypes.object,
        location: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        id: React.PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        edit: false,
        permissions: flattenPermissions(this.props.organization.page.permissions),
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChangeSlug = (event, slug) => {
        this.setState({ slug });
    }

    onChangeTitle = (event, title) => {
        this.setState({ title });
    }

    onChangeSummary = (event, summary) => {
        this.setState({ summary });
    }

    onChangeContent = (event, mdtext) => {
        this.setState({ mdtext });
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
        this.context.relay.commitUpdate(new EditPageMutation({
            viewer: null,
            pageid: page.id,
            slug: page.slug,
            title: page.title,
            summary: page.summary,
            mdtext: page.mdtext,
            permissions: page.permissions,
        }), {
            onSuccess: () => {
                this.closeEdit();
            },
            onFailure: (error, ost, kake) => {
                console.error('AD', error, ost, kake);
            },
        });
    }

    render() {
        const org = this.props.organization;
        if (!org.page.slug) {
            return (
                <section>
                    <h1>Not found: {this.props.location.pathname}</h1>
                </section>
            );
        }
        if (this.state.edit) {
            const page = org.page;
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
            <section>
                <div style={{ float: 'right' }}>
                    <IconMenu
                        iconButtonElement={<IconButton><ArrowDown /></IconButton>}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                        targetOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem primaryText="Rediger" onTouchTap={this.toggleEdit} />
                    </IconMenu>
                </div>
                <Text text={org.page.mdtext} />
            </section>
        );
    }
}

export default Relay.createContainer(Page, {
    initialVariables: {
        slug: null,
    },
    fragments: {
        viewer: () => Relay.QL`
        fragment on User {
            id
            groups {
                id
                name
            }
            ${EditPageMutation.getFragment('viewer')},
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            member_group {
                id
            }
            page(slug:$slug) {
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
    },
});
