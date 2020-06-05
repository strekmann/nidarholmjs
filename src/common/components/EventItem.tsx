import IconButton from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import Link from "found/Link";
import moment from "moment";
import React from "react";
import { createFragmentContainer, graphql } from "react-relay";
import Daterange from "./Daterange";
import Text from "./Text";
import { withTheme, Theme } from "@material-ui/core";

function isSoon(date) {
  if (!date) {
    return false;
  }
  const mdate = moment(date);
  if (
    mdate >= moment().startOf("day") &&
    mdate < moment().add(1, "week").startOf("day")
  ) {
    return true;
  }
  return false;
}

type Props = {
  event: {
    id: string;
    title: string;
    location: string;
    start: any;
    end: any;
    mdtext: string;
    isEnded: boolean;
    highlighted: boolean;
    tags: string[];
  };
  theme: Theme;
};

type State = {
  expanded: boolean;
};

class EventItem extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { event } = this.props;
    this.state = {
      expanded: isSoon(event.start),
    };
  }

  expandEvent = () => {
    const { expanded } = this.state;
    this.setState({
      expanded: !expanded,
    });
  };

  render() {
    const { event, theme } = this.props;
    const {
      id,
      title,
      location,
      start,
      end,
      mdtext,
      isEnded,
      highlighted,
      tags,
    } = event;
    const { expanded } = this.state;
    return (
      <Paper
        style={{ marginBottom: theme.spacing(2) }}
        className={isEnded ? "shade" : ""}
      >
        <div style={{ padding: theme.spacing(2) }}>
          <div style={{ float: "right" }}>
            <IconButton
              style={{ padding: 0, height: "inherit", width: "inherit" }}
              onClick={this.expandEvent}
            >
              {expanded ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </div>
          <h2 style={{ marginTop: theme.spacing(1) }}>
            <Link
              to={`/events/${id}`}
              style={{ fontWeight: highlighted ? "bold" : "normal" }}
            >
              {title}
            </Link>
          </h2>
          <div className="meta">
            <Daterange start={start} end={end} />
            {", "}
            {location}
          </div>
          {expanded ? (
            <div>
              <Text text={mdtext} />
              <div>
                {tags.map((tag) => {
                  return (
                    <span
                      key={tag}
                      style={{
                        color: "#555",
                        marginRight: 10,
                      }}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </Paper>
    );
  }
}

export default withTheme(
  createFragmentContainer(EventItem, {
    event: graphql`
      fragment EventItem_event on Event {
        id
        title
        location
        start
        end
        isEnded
        highlighted
        tags
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
        mdtext
      }
    `,
  }),
);
