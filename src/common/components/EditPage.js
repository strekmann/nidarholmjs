import React from 'react';

import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import PermissionField from './PermissionField';

export default class EditPage extends React.Component {
    static propTypes = {
        viewer: React.PropTypes.object,
        id: React.PropTypes.string,
        slug: React.PropTypes.string,
        title: React.PropTypes.string,
        summary: React.PropTypes.string,
        mdtext: React.PropTypes.string,
        permissions: React.PropTypes.array,
        savePage: React.PropTypes.func,
    }

    state = {
        id: this.props.id,
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
                    <Paper style={{ padding: 15 }}>
                        <h2>Forsidesnutt</h2>
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
                            ref={(p) => { this.permissions = p; }}
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
