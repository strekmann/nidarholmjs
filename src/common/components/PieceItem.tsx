import Link from "found/Link";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import * as React from "react";

import List from "./List";

type Props = {
  id: string,
  title: string,
  subtitle: string,
  scoreCount: number,
  arrangers: Array<string>,
  composers: Array<string>,
};

export default class ProjectItem extends React.Component<Props> {
  render() {
    const {
      id,
      scoreCount,
      title,
      subtitle,
      composers,
      arrangers,
    } = this.props;
    return (
      <TableRow>
        <TableCell style={{ width: "10%", minWidth: 50, overflow: "visible" }}>
          {scoreCount}
        </TableCell>
        <TableCell>
          <Link to={`/music/${id}`}>
            <ListItem>
              <ListItemText primary={title} secondary={subtitle} />
            </ListItem>
          </Link>
        </TableCell>
        <TableCell>
          <List items={composers} />{" "}
          <small>
            <List items={arrangers} />
          </small>
        </TableCell>
      </TableRow>
    );
  }
}
