import { createFragmentContainer, graphql } from "react-relay";
import Link from "found/Link";
import IconButton from "material-ui/IconButton";
import Paper from "material-ui/Paper";
import ExpandLess from "material-ui/svg-icons/navigation/expand-less";
import ExpandMore from "material-ui/svg-icons/navigation/expand-more";
import moment from "moment";
import * as React from "react";

import theme from "../theme";

import Daterange from "./Daterange";
import Text from "./Text";

function isSoon(date) {
  if (!date) {
    return false;
  }
  const mdate = moment(date);
  if (
    mdate >= moment().startOf("day") &&
    mdate <
      moment()
        .add(1, "week")
        .startOf("day")
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
};

type State = {
  expanded: boolean;
};

class EventItem extends React.Component<Props, State> {
  constructor(props) {
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
    const { event } = this.props;
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
    const { desktopGutterLess, desktopGutterMini } = theme.spacing;
    return (
      <Paper
        style={{ marginBottom: desktopGutterLess }}
        className={isEnded ? "shade" : ""}
      >
        <div style={{ padding: desktopGutterLess }}>
          <div style={{ float: "right" }}>
            <IconButton
              style={{ padding: 0, height: "inherit", width: "inherit" }}
              onClick={this.expandEvent}
            >
              {expanded ? <ExpandMore /> : <ExpandLess />}
            </IconButton>
          </div>
          <h2 style={{ marginTop: desktopGutterMini }}>
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
                        color: theme.palette.disabledColor,
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

export default createFragmentContainer(EventItem, {
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
});
