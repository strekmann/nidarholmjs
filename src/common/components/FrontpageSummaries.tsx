/* eslint "max-len": 0 */
/* eslint "react/no-multi-comp": 0 */

import IconButton from "@material-ui/core/Button";
import AddCircle from "material-ui/svg-icons/content/add-circle";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import PropTypes from "prop-types";
import * as React from "react";

import theme from "../theme";

import SortablePageList from "./SortablePageList";

type PageSummaryProps = {
  slug: string,
  title: string,
  onAdd: ({}) => void,
};

class PageSummaryItem extends React.Component<PageSummaryProps> {
  onAdd = () => {
    this.props.onAdd(this.props);
  };

  render() {
    const { title, slug } = this.props;
    const addIcon = (
      <IconButton onClick={this.onAdd}>
        <AddCircle />
      </IconButton>
    );
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{ flexGrow: 1 }}>
          <div>{title}</div>
          <div>/{slug}</div>
        </div>
        <div>{addIcon}</div>
      </div>
    );
  }
}

type Props = {
  onAdd: ({}) => void,
  onChange: any /*(
    Array<{
      id: string,
      slug: string,
      title: string,
    }>,
  ) => void,*/,
  pages: {
    edges: Array<{
      node: {
        id: string,
        key: string,
        slug: string,
        title: string,
      },
      cursor: string,
    }>,
  },
  summaries: Array<{
    id: string,
    slug: string,
    title: string,
  }>,
};

class FrontpageSummaries extends React.Component<Props> {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  constructor(props: any) {
    super(props);
    this.muiTheme = getMuiTheme(theme);
  }

  getChildContext() {
    return { muiTheme: this.muiTheme };
  }

  onChange = (
    summaries: Array<{
      id: string,
      slug: string,
      title: string,
    }>,
  ) => {
    this.props.onChange(summaries);
  };

  onAdd = (page: {}) => {
    this.props.onAdd(page);
  };

  muiTheme: {};

  render() {
    const summaryIds = this.props.summaries.map((summary) => {
      return summary.id;
    });
    return (
      <div>
        <h2>Forsidesnutter</h2>
        <p>
          Hvor mange som vises er avhengig av hvordan forsida er definert. Du
          kan trykke pluss i den nederste lista for å legge dem til, eller minus
          i den øverste for å fjerne dem.
        </p>
        <div style={{ display: "flex" }}>
          <div>
            <h3>Valgte</h3>
            <SortablePageList
              summaries={this.props.summaries}
              onChange={this.onChange}
            />
          </div>
          <div>
            <h3>Mulige</h3>
            <div
              style={{ height: 400, overflow: "scroll", overflowX: "hidden" }}
            >
              {this.props.pages.edges
                .filter((edge) => {
                  return !summaryIds.includes(edge.node.id);
                })
                .map((edge) => {
                  return (
                    <PageSummaryItem
                      key={edge.cursor}
                      onAdd={this.onAdd}
                      {...edge.node}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FrontpageSummaries;
