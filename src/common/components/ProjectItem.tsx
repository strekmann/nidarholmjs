import { Theme } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import withTheme from "@material-ui/core/styles/withTheme";
import Link from "found/Link";
import moment from "moment";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import Date from "./Date";
import Daterange from "./Daterange";
import List from "./List";
import PermissionVisibility from "./PermissionVisibility";
import Text from "./Text";
import { ProjectItem_project } from "./__generated__/ProjectItem_project.graphql";

const renderPublicEvents = (edges) => {
  return (
    <div className="meta">
      {edges.map((edge) => {
        return (
          <p key={edge.node.id}>
            {edge.node.location}
            {", "}
            <Date date={edge.node.start} format="llll" />
          </p>
        );
      })}
    </div>
  );
};

type Props = {
  project: ProjectItem_project;
  showText: boolean;
  theme: Theme;
};

class ProjectItem extends React.Component<Props> {
  render() {
    const { project, showText, theme } = this.props;
    const {
      title,
      start,
      end,
      tag,
      year,
      publicMdtext,
      events,
      poster,
      conductors,
      permissions,
    } = project;
    const widePoster = moment(end).isAfter(moment([2016, 7, 1]));
    if (widePoster) {
      return (
        <Paper style={{ marginBottom: theme.spacing(2) }}>
          {poster ? (
            <Link to={`/${year}/${tag}`}>
              <img
                alt=""
                src={poster.normalPath || undefined}
                className="responsive"
              />
            </Link>
          ) : null}
          <div
            style={{
              paddingLeft: theme.spacing(2),
              paddingRight: theme.spacing(2),
              paddingTop: poster ? 0 : theme.spacing(2),
              paddingBottom: theme.spacing(2),
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h2 style={{ marginTop: theme.spacing(1) }}>
                <Link
                  to={`/${year}/${tag}`}
                  className={`project-${year}-${tag}`}
                >
                  {title}
                </Link>
              </h2>
              <PermissionVisibility permissions={permissions} />
            </div>
            {renderPublicEvents(events.edges)}
            {conductors.length ? (
              <p>
                Dirigent:{" "}
                <List
                  items={conductors.map((conductor) => {
                    return conductor.name;
                  })}
                />
              </p>
            ) : null}
            {showText ? <Text text={publicMdtext} /> : null}
            <div className="meta">
              <Daterange start={start} end={end} noTime />
            </div>
          </div>
        </Paper>
      );
    }
    return (
      <Paper style={{ display: "flex", marginBottom: theme.spacing(2) }}>
        <div
          style={{ width: poster ? "50%" : "100%", padding: theme.spacing(2) }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2 style={{ marginTop: theme.spacing(1) }}>
              <Link to={`/${year}/${tag}`} className={`project-${year}-${tag}`}>
                {title}
              </Link>
            </h2>
            <PermissionVisibility permissions={permissions} />
          </div>
          {renderPublicEvents(events.edges)}
          {conductors.length ? (
            <p>
              Dirigent:{" "}
              <List
                items={conductors.map((conductor) => {
                  return conductor.name;
                })}
              />
            </p>
          ) : null}
          {showText ? <Text text={publicMdtext} /> : null}
          <div className="meta">
            <Daterange start={start} end={end} noTime />
          </div>
        </div>
        {poster ? (
          <img
            alt="Konsertplakat"
            src={poster.normalPath}
            style={{
              display: "inline-block",
              width: "50%",
              height: "100%",
              maxWidth: 230,
              paddingLeft: theme.spacing(2),
            }}
          />
        ) : null}
      </Paper>
    );
  }
}

export default withTheme(
  createFragmentContainer(ProjectItem, {
    project: graphql`
      fragment ProjectItem_project on Project {
        id
        title
        start
        end
        year
        tag
        publicMdtext
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
        poster {
          filename
          normalPath
        }
        conductors {
          name
        }
        events(first: 5, highlighted: true) {
          edges {
            node {
              id
              location
              start
            }
          }
        }
      }
    `,
  }),
);
