import React from "react";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { PermissionArray, Viewer } from "../types";

import PermissionField from "./PermissionField";
import { withTheme, Theme } from "@material-ui/core";

type Props = {
  viewer: Viewer,
  id?: string,
  slug?: string,
  title?: string,
  summary?: string,
  mdtext?: string,
  permissions: PermissionArray,
  savePage: any /*({
    id: ?string,
    slug: ?string,
    mdtext: ?string,
    title: ?string,
    summary: ?string,
    permissions: PermissionArray,
  }) => void,*/,
  theme: Theme,
};

type State = {
  slug?: string,
  title?: string,
  summary?: string,
  mdtext?: string,
  permissions: PermissionArray,
};

class EditPage extends React.Component<Props, State> {
  state = {
    slug: this.props.slug,
    title: this.props.title,
    summary: this.props.summary,
    mdtext: this.props.mdtext,
    permissions: this.props.permissions,
  };

  onChangeSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ slug: event.target.value });
  };

  onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  };

  onChangeSummary = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ summary: event.target.value });
  };

  onChangeContent = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ mdtext: event.target.value });
  };

  onPermissionChange = (
    permissions: Array<{
      id: string,
      name?: string,
    }>,
  ) => {
    this.setState({ permissions });
  };

  savePage = (event: any) => {
    event.preventDefault();
    this.props.savePage({
      id: this.props.id,
      slug: this.state.slug,
      mdtext: this.state.mdtext,
      title: this.state.title,
      summary: this.state.summary,
      permissions: this.state.permissions,
    });
  };

  render() {
    const { theme } = this.props;
    return (
      <section>
        <form onSubmit={this.savePage}>
          <h1>Rediger sideinnhold</h1>
          <div>
            <TextField
              id="mdtext"
              value={this.state.mdtext}
              label="Sideinnhold"
              multiline
              fullWidth
              onChange={this.onChangeContent}
              style={{ width: "100%" }}
            />
          </div>
          <Paper style={{ padding: theme.spacing(2) }}>
            <h2>Forsidesnutt</h2>
            <p>
              Tittel og introduksjon til bruk på forsida. Det er ennå ikke
              automatikk i legge snutten til på forsida.
            </p>
            <TextField
              id="title"
              value={this.state.title}
              label="Tittel"
              onChange={this.onChangeTitle}
            />
            <TextField
              id="summary"
              value={this.state.summary}
              label="Introduksjon"
              multiline
              fullWidth
              onChange={this.onChangeSummary}
            />
          </Paper>
          <div>
            <TextField
              id="slug"
              value={this.state.slug}
              label="Identifikator"
              onChange={this.onChangeSlug}
              helperText="Bør sjelden endres, da den endrer adressen til sida."
              required
            />
            <PermissionField
              permissions={this.state.permissions}
              onChange={this.onPermissionChange}
              groups={this.props.viewer.groups}
              users={[]}
            />
          </div>
          <div>
            <Button variant="contained" type="submit">
              Lagre
            </Button>
          </div>
        </form>
      </section>
    );
  }
}

export default withTheme(EditPage);
