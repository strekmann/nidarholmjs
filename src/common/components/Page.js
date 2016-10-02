import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down';

import theme from '../theme';
import EditPageMutation from '../mutations/editPage';
import Text from './Text';

class Page extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static propTypes = {
        organization: React.PropTypes.object,
    }

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    static propTypes = {
        id: React.PropTypes.string,
        slug: React.PropTypes.string,
        summary: React.PropTypes.string,
        mdtext: React.PropTypes.string,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme);
    }

    state = {
        edit: false,
        slug: this.props.organization.page.slug,
        summary: this.props.organization.page.summary,
        mdtext: this.props.organization.page.mdtext,
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    onChangeSlug = (event, slug) => {
        this.setState({ slug });
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

    savePage = (event) => {
        event.preventDefault();
        const page = this.props.organization.page;
        this.context.relay.commitUpdate(new EditPageMutation({
            viewer: null,
            pageid: page.id,
            slug: page.slug,
            summary: page.summary,
            mdtext: page.mdtext,
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
        if (this.state.edit) {
            return (
                <section>
                    <form onSubmit={this.savePage}>
                        <h1>Rediger sideinnhold</h1>
                        <div>
                            <TextField
                                id="mdtext"
                                value={this.state.mdtext}
                                floatingLabelText="Sideinnhold"
                                multiLine
                                fullWidth
                                onChange={this.onChangeContent}
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div>
                            <TextField
                                id="summary"
                                value={this.state.summary}
                                floatingLabelText="Introduksjon"
                                multiLine
                                fullWidth
                                onChange={this.onChangeSummary}
                            />
                        </div>
                        <div>
                            <TextField
                                id="slug"
                                value={this.state.slug}
                                floatingLabelText="Identifikator"
                                onChange={this.onChangeSlug}
                                hintText="Bør sjelden endres, da den endrer adressen til sida."
                            />
                        </div>
                        <div>
                            <RaisedButton type="submit" label="Lagre" />
                        </div>
                    </form>
                </section>
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
            ${EditPageMutation.getFragment('viewer')},
        }
        `,
        organization: () => Relay.QL`
        fragment on Organization {
            page(slug:$slug) {
                id
                slug
                summary
                mdtext
                created
                updated
                updator {
                    name
                }
            }
        }`,
    },
});
