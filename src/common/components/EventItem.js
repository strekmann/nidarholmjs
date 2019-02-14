/* @flow */

import { createFragmentContainer, graphql } from "react-relay";
import Link from "found/lib/Link";
import IconButton from "material-ui/IconButton";
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
    id: string,
    title: string,
    location: string,
    start: any,
    end: any,
    mdtext: string,
    isEnded: boolean,
    highlighted: boolean,
    tags: string[],
  },
};

type State = {
  expanded: boolean,
};

class EventItem extends React.Component<Props, State> {
  state = {
    expanded: isSoon(this.props.event.start),
  };

  expandEvent = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  render() {
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
    } = this.props.event;
    const { desktopGutterMini } = theme.spacing;
    return (
      <div
        style={{ marginBottom: desktopGutterMini }}
        className={isEnded ? "shade" : ""}
      >
        <div style={{ float: "right" }}>
          <IconButton
            style={{ padding: 0, height: "inherit", width: "inherit" }}
            onClick={this.expandEvent}
          >
            {this.state.expanded ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </div>
        <h3 style={{ marginBottom: 0 }}>
          <Link
            to={`/events/${id}`}
            style={{ fontWeight: highlighted ? "bold" : "normal" }}
          >
            {title}
          </Link>
        </h3>
        <div className="meta">
          <Daterange start={start} end={end} /> {location}
        </div>
        {this.state.expanded ? (
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
