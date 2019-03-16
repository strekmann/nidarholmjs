// @flow

import Paper from "material-ui/Paper";
import moment from "moment";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import Link from "found/lib/Link";

import theme from "../theme";

import Date from "./Date";
import Daterange from "./Daterange";
import List from "./List";
import Text from "./Text";
import ProjectItemProject from "./__generated__/ProjectItem_project.graphql";

const renderPublicEvents = (edges) => {
  return (
    <div className="meta">
      {edges.map((edge) => {
        return (
          <p key={edge.node.id}>
            {edge.node.location} <Date date={edge.node.start} format="llll" />
          </p>
        );
      })}
    </div>
  );
};

type Props = {
  project: ProjectItemProject,
  showText: boolean,
};

class ProjectItem extends React.Component<Props> {
  render() {
    const { project, showText } = this.props;
    const { desktopGutterLess, desktopGutterMini } = theme.spacing;
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
    } = project;
    const widePoster = moment(end).isAfter(moment([2016, 7, 1]));
    if (widePoster) {
      return (
        <Paper style={{ marginBottom: desktopGutterLess }}>
          {poster ? (
            <Link to={`/${year}/${tag}`}>
              <img alt="" src={poster.normalPath} className="responsive" />
            </Link>
          ) : null}
          <div
            style={{
              paddingLeft: desktopGutterLess,
              paddingRight: desktopGutterLess,
              paddingTop: poster ? null : desktopGutterLess,
              paddingBottom: desktopGutterLess,
            }}
          >
            <h2 style={{ marginTop: desktopGutterMini }}>
              <Link to={`/${year}/${tag}`}>{title}</Link>
            </h2>
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
      <Paper style={{ display: "flex", marginBottom: desktopGutterLess }}>
        <div
          style={{ width: poster ? "50%" : "100%", padding: desktopGutterLess }}
        >
          <h2 style={{ marginTop: desktopGutterMini }}>
            <Link to={`/${year}/${tag}`}>{title}</Link>
          </h2>
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
              paddingLeft: desktopGutterLess,
            }}
          />
        ) : null}
      </Paper>
    );
  }
}

export default createFragmentContainer(ProjectItem, {
  project: graphql`
    fragment ProjectItem_project on Project {
      id
      title
      start
      end
      year
      tag
      publicMdtext
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
});
