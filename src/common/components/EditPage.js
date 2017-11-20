/* eslint "max-len": 0 */

import React from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import PropTypes from 'prop-types';

import theme from '../theme';

import PermissionField from './PermissionField';

export default class EditPage extends React.Component {
    static propTypes = {
        viewer: PropTypes.object,
        slug: PropTypes.string,
        title: PropTypes.string,
        summary: PropTypes.string,
        mdtext: PropTypes.string,
        permissions: PropTypes.array,
        savePage: PropTypes.func,
    }

    state = {
        slug: this.props.slug,
        title: this.props.title,
        summary: this.props.summary,
        mdtext: this.props.mdtext,
        permissions: this.props.permissions,
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

    onPermissionChange = (permissions) => {
        this.setState({ permissions });
    }

    savePage = (event) => {
        event.preventDefault();
        this.props.savePage(this.state);
    }

    render() {
        const { desktopGutterLess } = theme.spacing;
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
                    <Paper style={{ padding: desktopGutterLess }}>
                        <h2>Forsidesnutt</h2>
                        <p>Tittel og introduksjon til bruk på forsida. Det er ennå ikke automatikk i legge snutten til på forsida.</p>
                        <TextField
                            id="title"
                            value={this.state.title}
                            floatingLabelText="Tittel"
                            onChange={this.onChangeTitle}
                        />
                        <TextField
                            id="summary"
                            value={this.state.summary}
                            floatingLabelText="Introduksjon"
                            multiLine
                            fullWidth
                            onChange={this.onChangeSummary}
                        />
                    </Paper>
                    <div>
                        <TextField
                            id="slug"
                            value={this.state.slug}
                            floatingLabelText="Identifikator"
                            onChange={this.onChangeSlug}
                            hintText="Bør sjelden endres, da den endrer adressen til sida."
                            required
                        />
                        <PermissionField
                            permissions={this.state.permissions}
                            onChange={this.onPermissionChange}
                            groups={this.props.viewer.groups}
                            users={this.props.viewer.friends}
                        />
                    </div>
                    <div>
                        <RaisedButton type="submit" label="Lagre" />
                    </div>
                </form>
            </section>
        );
    }
}
